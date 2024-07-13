<?php

namespace App\Http\Controllers\items;

use Illuminate\Http\Request;
use App\Models\items\Metal;
use App\Models\items\Product_Metal;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Tymon\JWTAuth\Exceptions\JWTException;
use Throwable;

class MetalController extends Controller
{
/**
 * @OA\Post(
 *     path="/api/update_price",
 *     summary="Update metal prices and recalculate product prices",
 *     tags={"Metal"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"update_price"},
 *             @OA\Property(property="update_price", type="object",
 *                 @OA\Property(property="metal_id", type="integer", example=1),
 *                 @OA\Property(property="buy_price_per_gram", type="number", format="float", example=30.5),
 *                 @OA\Property(property="sale_price_per_gram", type="number", format="float", example=50.0),
 *             ),
 *         ),
 *     ),
 *     @OA\Response(response="201", description="Price updated successfully"),
 *     @OA\Response(response="403", description="No input received or selected metal is deactivated", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="No input received or selected metal is deactivated"),
 *     )),
 *     @OA\Response(response="500", description="Server error", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="Server error message"),
 *     )),
 * )
 */
    public function update_price(Request $request)
    {
        //input
        $input = json_decode($request->input('update_price'), true);
        if (!isset($input) || $input == null) {
            return response()->json([
                'error' => 'No input received'
            ], 403);
        }
        DB::beginTransaction();
        try {
            $metal = DB::table('metal')->where('id', $input['metal_id'])->first();
            if ($metal->deactivated) {
                return response()->json([
                    'error' => 'The selected metal has been deactivated'
                ], 403);
            }
            //find all product that contain the selected metal
            $product_metal = DB::table('product_metal')->select('product_id')->where('metal_id', $input['metal_id'])->groupby('product_id')->get();
            //update the metal price
            DB::table('metal')->where('id', $input['metal_id'])->update([
                'buy_price_per_gram' => $input['buy_price_per_gram'],
                'sale_price_per_gram' => $input['sale_price_per_gram'],
                'created' => Carbon::now()->format('Y-m-d H:i:s')
            ]);
            $data = [];
            foreach ($product_metal as $product) {
                $temp1 = DB::table('orders')->where('product_id', $product->product_id)->first();
                if ($temp1 != null) {
                    if ($temp1->order_status_id >= 3) {
                        continue;
                    }
                }
                $true = false;
                //find all product_metal list to update price
                $metal_list = DB::table('product_metal')->where('product_id', $product->product_id)->where('metal_id', $input['metal_id'])->get();
                //check if the list has already been update previously to avoid removing the original price
                foreach ($metal_list as $metal) {
                    if ($metal->status == 3) {
                        $true = true;
                    }
                }
                //loop to update metal price
                foreach ($metal_list as $metal) {
                    //update current metal price
                    if ($metal->status == 1) {
                        if (!$true) {
                            //set status to save the original current metal price before update price
                            DB::table('product_metal')->where('product_id', $product->product_id)->where('metal_id', $metal->metal_id)->where('status', 1)->update([
                                'status' => 3
                            ]);
                        }
                        $temp = [
                            'product_id' => $product->product_id,
                            'metal_id' => $metal->metal_id,
                            'volume' => $metal->volume,
                            'weight' => $metal->weight,
                            'price' => $input['sale_price_per_gram'] * $metal->weight,
                            'status' => 1
                        ];
                        //delete the current metal price if the original current metal price has already been saved
                        DB::table('product_metal')->where('product_id', $product->product_id)->where('metal_id', $metal->metal_id)->where('status', 1)->delete();
                        $data[] = $temp;
                    } else if ($metal->status == 0) {
                        if (!$true) {
                            //set status to save the original future metal price before update price
                            DB::table('product_metal')->where('product_id', $product->product_id)->where('metal_id', $metal->metal_id)->where('status', 0)->update([
                                'status' => 4
                            ]);
                        }
                        $temp = [
                            'product_id' => $product->product_id,
                            'metal_id' => $metal->metal_id,
                            'volume' => $metal->volume,
                            'weight' => $metal->weight,
                            'price' => $input['sale_price_per_gram'] * $metal->weight,
                            'status' => 0
                        ];
                        //delete the future metal price if the original metal price has already been saved
                        DB::table('product_metal')->where('product_id', $product->product_id)->where('metal_id', $metal->metal_id)->where('status', 0)->delete();
                        $data[] = $temp;
                    }
                }
            }
            //insert all the update metal price
            DB::table('product_metal')->insert($data);
            //loop to update metal price in order and quote
            foreach ($product_metal as $product) {
                $temp1 = DB::table('orders')->where('product_id', $product->product_id)->first();
                if ($temp1 != null) {
                    if ($temp1->order_status_id >= 3) {
                        continue;
                    }
                }
                $order = DB::table('orders')->where('product_id', $product->product_id)->first();
                //check if order exist
                if ($order != null) {
                    $profit_rate = $order->profit_rate;
                    $production_price = $order->production_price;
                    $product_price = 0;
                    $diamond_list = DB::table('product_diamond')->where('product_id', $order->product_id)->where('status', 1)->get();
                    $metal_list = DB::table('product_metal')->where('product_id', $order->product_id)->where('status', 1)->get();
                    //calculate new product price after update metal price
                    foreach ($diamond_list as $diamond) {
                        if ($diamond->status == 1) {
                            $product_price += $diamond->price;
                        }
                    }
                    foreach ($metal_list as $metal) {
                        if ($metal->status == 1) {
                            $product_price += $metal->price;
                        }
                    }
                    DB::table('orders')->where('product_id', $product->product_id)->update([
                        'product_price' => $product_price,
                        'total_price' => ceil(($product_price) * ($profit_rate + 100) / 100 + $production_price)
                    ]);
                }

                $quote = DB::table('quote')->where('product_id', $product->product_id)->first();
                //check if quote exist
                if ($quote != null) {
                    $profit_rate = $quote->profit_rate;
                    $production_price = $quote->production_price;
                    $product_price = 0;
                    $diamond_list = DB::table('product_diamond')->where('product_id', $quote->product_id)->where('status', 1)->get();
                    $metal_list = DB::table('product_metal')->where('product_id', $quote->product_id)->where('status', 1)->get();
                    //calculate new product price after update metal price
                    foreach ($diamond_list as $diamond) {
                        if ($diamond->status == 1) {
                            $product_price += $diamond->price;
                        }
                    }
                    foreach ($metal_list as $metal) {
                        if ($metal->status == 1) {
                            $product_price += $metal->price;
                        }
                    }
                    DB::table('quote')->where('product_id', $product->product_id)->update([
                        'product_price' => $product_price,
                        'total_price' => ceil(($product_price) * ($profit_rate + 100) / 100 + $production_price)
                    ]);
                }
                if ($order != null) {
                    $design_process = DB::table('design_process')->where('order_id', $order->id)->first();
                    //check if quote exist
                    if ($design_process != null && $design_process->design_process_status_id < 4) {
                        $profit_rate = $design_process->profit_rate;
                        $production_price = $design_process->production_price;
                        $product_price = 0;
                        if ($design_process->design_process_status_id < 3) {
                            $diamond_list = DB::table('product_diamond')->where('product_id', $order->product_id)->where('status', 0)->get();
                            $metal_list = DB::table('product_metal')->where('product_id', $order->product_id)->where('status', 0)->get();
                        } else if ($design_process->design_process_status_id = 3) {
                            $diamond_list = DB::table('product_diamond')->where('product_id', $order->product_id)->where('status', 2)->get();
                            $metal_list = DB::table('product_metal')->where('product_id', $order->product_id)->where('status', 2)->get();
                        }
                        //calculate new product price after update metal price
                        foreach ($diamond_list as $diamond) {
                            if ($diamond->status == 1) {
                                $product_price += $diamond->price;
                            }
                        }
                        foreach ($metal_list as $metal) {
                            if ($metal->status == 1) {
                                $product_price += $metal->price;
                            }
                        }
                        DB::table('design_process')->where('order_id', $order->id)->update([
                            'product_price' => $product_price,
                            'total_price' => ceil(($product_price) * ($profit_rate + 100) / 100 + $production_price)
                        ]);
                    }
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json($e->getMessage(), 500);
        }
        return response()->json([
            'success' => 'Price update successfully'
        ], 201);
    }
    /**
     * @OA\Post(
     *     path="/api/set_deactivate",
     *     summary="Activate or deactivate a metal",
     *     tags={"Metal"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"deactivate"},
     *             @OA\Property(property="deactivate", type="boolean", example=true),
     *             @OA\Property(property="metal_id", type="integer", example=1),
     *         ),
     *     ),
     *     @OA\Response(response="201", description="Metal activated or deactivated successfully"),
     *     @OA\Response(response="403", description="No input received or selected metal doesn't exist", @OA\JsonContent(
     *         @OA\Property(property="error", type="string", example="No input received or selected metal doesn't exist"),
     *     )),
     *     @OA\Response(response="500", description="Server error", @OA\JsonContent(
     *         @OA\Property(property="error", type="string", example="Server error message"),
     *     )),
     * )
     */
    public function set_deactivate(Request $request)
    {
        //input
        $input = json_decode($request->input('deactivate'), true);
        if (!isset($input) || $input == null) {
            return response()->json([
                'error' => 'No input received'
            ], 403);
        }
        DB::beginTransaction();
        try {
            $tf = false;
            $metal = DB::table('metal')->where('id', $input['metal_id'])->first();
            //check metal
            if ($metal == null) {
                return response()->json([
                    'error' => 'The selected metal doesn\'t exist'
                ], 403);
            }
            //check input deactivate
            if ($input['deactivate']) {
                DB::table('metal')->where('id', $input['metal_id'])->update([
                    'deactivated' => true,
                ]);
                $tf = true;
            } else {
                DB::table('metal')->where('id', $input['metal_id'])->update([
                    'deactivated' => false,
                ]);
                $tf = false;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json($e->getMessage(), 500);
        }
        if ($tf) {
            return response()->json([
                'success' => 'Deactivate metal successfully'
            ], 201);
        } else {
            return response()->json([
                'success' => 'Activate metal successfully'
            ], 201);
        }
    }
    /**
     * @OA\Post(
     *     path="/api/items/metal/get_list",
     *     summary="Get list of metals based on user role",
     *     tags={"Metal"},
     *     @OA\RequestBody(
     *         required=false,
     *     ),
     *     @OA\Response(response="200", description="List of metals"),
     *     @OA\Response(response="401", description="Invalid Token", @OA\JsonContent(
     *         @OA\Property(property="error", type="string", example="Invalid Token"),
     *     )),
     * )
     */
    public function get_list(Request $request)
    {
        //check token
        $authorizationHeader = $request->header('Authorization');
        $token = null;

        if ($authorizationHeader && strpos($authorizationHeader, 'Bearer ') === 0) {
            $token = substr($authorizationHeader, 7); // Extract the token part after 'Bearer '
            try {
                $decodedToken = JWTAuth::decode(new \Tymon\JWTAuth\Token($token));
            } catch (JWTException $e) {
                try {
                    $decodedToken = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
                } catch (\Exception $e) {
                    return response()->json(['error' => 'Invalid Token'], 401);
                }
            }
        }
        if ($token == null) {
            $role_id = 5;
        } else {
            try {
                $role_id = $decodedToken['role_id'];
            } catch (Throwable $e) {
                $role_id = $decodedToken->role_id;
            }
        }

        //create query
        $query = Metal::query();
        //check role
        if ($role_id == 5 || $role_id == 4 || $role_id == 3 || $role_id == 2) {
            //configure query
            $metal = $query->where('deactivated', false)->get();
            $metal->map(function ($metal) {
                $OGurl = env('ORIGIN_URL');
                $url = env('METAL_URL');
                $metal->imageUrl = $OGurl . $url . $metal->id . "/" . $metal->imageUrl;
                $metal->created = Carbon::parse($metal->created)->format('H:i:s d/m/Y');
                return $metal;
            });
        } else {
            $metal = $query->orderBy('deactivated', 'asc')->get();
            $metal->map(function ($metal) {
                $OGurl = env('ORIGIN_URL');
                $url = env('METAL_URL');
                $metal->imageUrl = $OGurl . $url . $metal->id . "/" . $metal->imageUrl;
                $metal->created = Carbon::parse($metal->created)->format('H:i:s d/m/Y');
                return $metal;
            });
        }
        return response()->json(
            $metal
        );
    }
    /**
 * @OA\Post(
 *     path="/api/items/metal/get_detail",
 *     summary="Get details of a metal by ID",
 *     tags={"Metal"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"metal_id"},
 *             @OA\Property(property="metal_id", type="integer", example=1),
 *         ),
 *     ),
 *     @OA\Response(response="200", description="Details of the metal", @OA\JsonContent(
 *         @OA\Property(property="metal", type="object", ref="#/components/schemas/Metal"),
 *     )),
 *     @OA\Response(response="403", description="No input received", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="No input received"),
 *     )),
 *     @OA\Response(response="404", description="Metal not found", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="Metal not found"),
 *     )),
 *     @OA\Response(response="500", description="Server error", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="Server error message"),
 *     )),
 * )
 */
    public function get_detail(Request $request)
    {
        //input
        $input = json_decode($request->input('metal_id'), true);
        if (!isset($input) || $input == null) {
            return response()->json([
                'error' => 'No input received'
            ], 403);
        }
        $metal = DB::table('metal')->where('id', $input)->first();
        $OGurl = env('ORIGIN_URL');
        $url = env('METAL_URL');
        $metal->imageUrl = $OGurl . $url . $metal->id . "/" . $metal->imageUrl;
        $metal->created = Carbon::parse($metal->created)->format('H:i:s d/m/Y');
        return response()->json([
            'metal' => $metal
        ]);
    }

    /**
 * @OA\Post(
 *     path="/api/items/metal/get_weight_price",
 *     summary="Calculate weight and price based on metal information",
 *     tags={"Metal"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"metal_information"},
 *             @OA\Property(property="metal_information", type="object",
 *                 @OA\Property(property="metal_id", type="integer", example=1),
 *                 @OA\Property(property="volume", type="number", format="float", example=10.5),
 *             ),
 *         ),
 *     ),
 *     @OA\Response(response="200", description="Weight and price calculated successfully", @OA\JsonContent(
 *         @OA\Property(property="weight_price", type="object",
 *             @OA\Property(property="weight", type="number", format="float", example=105.0),
 *             @OA\Property(property="price", type="number", format="float", example=5250.0),
 *         ),
 *     )),
 *     @OA\Response(response="403", description="No input received", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="No input received"),
 *     )),
 *     @OA\Response(response="404", description="Metal has been deactivated", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="The selected metal has been deactivated"),
 *     )),
 *     @OA\Response(response="500", description="Server error", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="Server error message"),
 *     )),
 * )
 */
    public function get_weight_price(Request $request)
    {
        //input
        $input = json_decode($request->input('metal_information'), true);
        if (!isset($input) || $input == null) {
            return response()->json([
                'error' => 'No input received'
            ], 403);
        }
        $metal = DB::table('metal')->where('id', $input['metal_id'])->first();
        if ($metal->deactivated) {
            return response()->json([
                'error' => 'The selected metal has been deactivated'
            ], 403);
        }
        $weight = $metal->specific_weight * $input['volume'];
        $price = $weight * $metal->sale_price_per_gram;
        $temp['weight'] = $weight;
        $temp['price'] = $price;
        return response()->json([
            'weight_price' => $temp
        ]);
    }
    /**
 * @OA\Post(
 *     path="/api/items/metal/get_metal_is_main",
 *     summary="Get main metals associated with a model",
 *     tags={"Metal"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"model_id"},
 *             @OA\Property(property="model_id", type="integer", example=1),
 *         ),
 *     ),
 *     @OA\Response(response="200", description="List of main metals", @OA\JsonContent(
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/Metal"),
 *     )),
 *     @OA\Response(response="403", description="No input received", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="No input received"),
 *     )),
 *     @OA\Response(response="500", description="Server error", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="Server error message"),
 *     )),
 * )
 */
    public function get_metal_is_main(Request $request)
    {
        //input
        $input = json_decode($request->input('model_id'), true);
        if (!isset($input) || $input == null) {
            return response()->json([
                'error' => 'No input received'
            ], 403);
        }
        $metal_list = DB::table('model_metal')->where('model_id', $input)->where('is_main', true)->pluck('metal_id');
        $data = collect();
        foreach ($metal_list as $metal) {
            $temp = DB::table('metal')->where('id', $metal)->first();
            $temp->created = Carbon::parse($temp->created)->format('H:i:s d/m/Y');
            $data->push($temp);
        }
        return response()->json(
            $data
        );
    }
    /**
 * @OA\Post(
 *     path="/api/items/metal/get_metal_compatibility",
 *     summary="Get compatible metals for a model",
 *     tags={"Metal"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"metal_compatibility"},
 *             @OA\Property(property="metal_compatibility", type="object",
 *                 @OA\Property(property="metal_id", type="integer", example=1),
 *                 @OA\Property(property="model_id", type="integer", example=1),
 *             ),
 *         ),
 *     ),
 *     @OA\Response(response="200", description="List of compatible metals", @OA\JsonContent(
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/Metal"),
 *     )),
 *     @OA\Response(response="403", description="No input received", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="No input received"),
 *     )),
 *     @OA\Response(response="404", description="No compatibility metal found", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="No compatibility metal found"),
 *     )),
 *     @OA\Response(response="500", description="Server error", @OA\JsonContent(
 *         @OA\Property(property="error", type="string", example="Server error message"),
 *     )),
 * )
 */
    public function get_metal_compatibility(Request $request)
    {
        //input
        $input = json_decode($request->input('metal_compatibility'), true);
        if (!isset($input) || $input == null) {
            return response()->json([
                'error' => 'No input received'
            ], 403);
        }
        $metal = DB::table('metal')->where('id', $input['metal_id'])->first();
        if ($metal->deactivated) {
            return response()->json([
                'error' => 'The selected metal has been deactivated'
            ], 403);
        }
        $OGurl = env('ORIGIN_URL');
        $url = env('METAL_URL');
        $metal_list = DB::table('model_metal')->where('model_id', $input['model_id'])->where('is_main', false)->pluck('metal_id')->values();
        foreach ($metal_list as $metal) {
            $temp1 = DB::table('metal')->where('id', $metal)->first();
            if ($temp1->deactivated) {
                $metal_list = $metal_list->reject(function ($value, $key) use ($metal) {
                    return $value == $metal;
                });
            }
        }
        $metal_compatibility = DB::table('metal_compatibility')->where('Metal_id_1', $input['metal_id'])->pluck('Metal_id_2')->values();
        $data = collect();
        foreach ($metal_list as $metal1) {
            foreach ($metal_compatibility as $compability) {
                if ($metal1 == $compability) {
                    $temp = DB::table('model_metal')->where('model_id', $input['model_id'])->where('metal_id', $metal1)->first();
                    $temp->metal = DB::table('metal')->where('id', $metal1)->first();
                    if ($temp->metal->deactivated) {
                        continue;
                    }
                    $temp->metal->imageUrl = $OGurl . $url . $temp->metal->id . "/" . $temp->metal->imageUrl;
                    $temp->metal->created = Carbon::parse($temp->metal->created)->format('H:i:s d/m/Y');
                    unset($temp->metal_id);
                    unset($temp->model_id);
                    unset($temp->id);
                    $data->push($temp);
                }
            }
        }
        if ($data->isEmpty()) {
            return response()->json([
                'error' => 'No compatibility metal found'
            ], 403);
        }
        return response()->json(
            $data
        );
    }
}
