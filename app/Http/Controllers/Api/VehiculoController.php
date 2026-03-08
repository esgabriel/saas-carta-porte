<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreVehiculoRequest;
use App\Http\Requests\Api\UpdateVehiculoRequest;
use App\Models\Vehiculo;
use App\Services\TenantContext;

class VehiculoController extends Controller
{
    public function __construct(protected TenantContext $tenantContext)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => Vehiculo::with('seguros')->get()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVehiculoRequest $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantContext->getTenantId();

        $vehiculo = Vehiculo::create($data);

        return response()->json([
            'message' => 'Vehículo creado correctamente.',
            'data' => $vehiculo
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehiculo $vehiculo): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $vehiculo]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVehiculoRequest $request, Vehiculo $vehiculo): \Illuminate\Http\JsonResponse
    {
        $vehiculo->update($request->validated());

        return response()->json([
            'message' => 'Vehículo actualizado correctamente.',
            'data' => $vehiculo
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * Si el vehículo tiene viajes asociados se devuelve 409 con el conteo
     * para que el frontend ofrezca la opción de desactivarlo en su lugar.
     */
    public function destroy(Vehiculo $vehiculo): \Illuminate\Http\JsonResponse
    {
        $viajesCount = $vehiculo->viajes()->count();

        if ($viajesCount > 0) {
            return response()->json([
                'message'      => "Este vehículo tiene {$viajesCount} " .
                                  ($viajesCount === 1 ? 'viaje asociado' : 'viajes asociados') .
                                  '. Puedes desactivarlo para que no aparezca en nuevos viajes.',
                'viajes_count' => $viajesCount,
            ], 409);
        }

        $vehiculo->delete();

        return response()->json(null, 204);
    }
}
