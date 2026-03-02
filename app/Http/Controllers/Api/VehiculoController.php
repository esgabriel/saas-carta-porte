<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreVehiculoRequest;
use App\Http\Requests\Api\UpdateVehiculoRequest;
use App\Models\Vehiculo;
use App\Services\TenantContext;

class VehiculoController extends Controller
{
    protected string $tenantId;

    public function __construct(TenantContext $tenantContext)
    {
        $this->tenantId = $tenantContext->getTenantId();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vehiculos = Vehiculo::all();
        return response()->json(['data' => $vehiculos]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVehiculoRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantId;

        $vehiculo = Vehiculo::create($data);

        return response()->json([
            'message' => 'Vehículo creado correctamente.',
            'data' => $vehiculo
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehiculo $vehiculo)
    {
        return response()->json(['data' => $vehiculo]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVehiculoRequest $request, Vehiculo $vehiculo)
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
    public function destroy(Vehiculo $vehiculo)
    {
        $vehiculo->delete();

        return response()->json([
            'message' => 'Vehículo eliminado correctamente.'
        ], 204);
    }
}
