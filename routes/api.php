<?php

use App\Http\Controllers\Api\CartaPorteController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\OperadorController;
use App\Http\Controllers\Api\RemolqueController;
use App\Http\Controllers\Api\UbicacionController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\ViajeController;
use Illuminate\Support\Facades\Route;

/* |-------------------------------------------------------------------------- | API Routes — SaaS Carta Porte |-------------------------------------------------------------------------- | Todas las rutas pasan por TenantMiddleware, que lee el header X-Tenant-ID | y lo registra en TenantContext para que TenantScope filtre automáticamente | todas las consultas Eloquent por tenant_id. | | Prefijo base: /api/v1 */

Route::prefix('v1')
    ->middleware(['tenant'])
    ->group(function () {

        // Catálogos del tenant
        Route::apiResource('clientes', ClienteController::class);
        Route::apiResource('operadores', OperadorController::class);
        Route::apiResource('vehiculos', VehiculoController::class);
        Route::apiResource('remolques', RemolqueController::class);
        Route::apiResource('ubicaciones', UbicacionController::class);

        // Operación
        Route::apiResource('viajes', ViajeController::class);

        // Documentación fiscal
        Route::apiResource('cartas-porte', CartaPorteController::class)
            ->parameters(['cartas-porte' => 'cartaPorte']);
    });
