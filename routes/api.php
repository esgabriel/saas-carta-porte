<?php

use App\Http\Controllers\Api\CartaPorteController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\OperadorController;
use App\Http\Controllers\Api\RemolqueController;
use App\Http\Controllers\Api\SeguroController;
use App\Http\Controllers\Api\UbicacionController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\ViajeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->middleware(['tenant'])
    ->group(function () {
        Route::apiResource('clientes',   ClienteController::class);
        Route::apiResource('operadores', OperadorController::class);
        Route::apiResource('vehiculos',  VehiculoController::class);
        Route::apiResource('remolques',  RemolqueController::class);
        Route::apiResource('ubicaciones', UbicacionController::class);
        Route::apiResource('viajes',     ViajeController::class);

        // Seguros: sólo crear y borrar (se gestionan desde la pantalla de Vehículos)
        Route::apiResource('seguros', SeguroController::class)->only(['store', 'destroy']);

        Route::apiResource('cartas-porte', CartaPorteController::class)
            ->parameters(['cartas-porte' => 'cartaPorte']);
    });