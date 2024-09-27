<?php

use App\Http\Middleware\checkUserLogin;
use App\Http\Middleware\checkAdminLogin;
use App\Http\Middleware\checkManager;
use App\Http\Middleware\checkSaleStaff;
use App\Http\Middleware\checkDesignStaff;
use App\Http\Middleware\checkProductionStaff;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Middleware\SkipNgrokBrowserWarning;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    
    ->withMiddleware(function (Middleware $middleware) {
        
        $middleware->appendToGroup('checkAdminLogin', [
            checkAdminLogin::class,
        ]);
        $middleware->appendToGroup('checkUserLogin', [
            checkUserLogin::class,
        ]);
        $middleware->appendToGroup('checkManager', [
            checkManager::class,
        ]);
        $middleware->appendToGroup('checkSaleStaff', [
            checkSaleStaff::class,
        ]);
        $middleware->appendToGroup('checkDesignStaff', [
            checkDesignStaff::class,
        ]);
        $middleware->appendToGroup('checkProductionStaff', [
            checkProductionStaff::class,
        ]);
        $middleware->appendToGroup('checkCors', [
            CorsMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
