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
        return response()->json(['data' => Vehiculo::all()]);
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
     */
    public function destroy(Vehiculo $vehiculo): \Illuminate\Http\JsonResponse
    {
        $vehiculo->delete();

        return response()->json(null, 204);
    }
}
