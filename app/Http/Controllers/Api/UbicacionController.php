<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreUbicacionRequest;
use App\Http\Requests\Api\UpdateUbicacionRequest;
use App\Models\Ubicacion;
use App\Services\TenantContext;

class UbicacionController extends Controller
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
        $ubicaciones = Ubicacion::all();
        return response()->json(['data' => $ubicaciones]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUbicacionRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantId;

        $ubicacion = Ubicacion::create($data);

        return response()->json([
            'message' => 'Ubicación creada correctamente.',
            'data' => $ubicacion
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ubicacion $ubicasione)
    {
        return response()->json(['data' => $ubicasione]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUbicacionRequest $request, Ubicacion $ubicasione)
    {
        $ubicasione->update($request->validated());

        return response()->json([
            'message' => 'Ubicación actualizada correctamente.',
            'data' => $ubicasione
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ubicacion $ubicasione)
    {
        $ubicasione->delete();

        return response()->json([
            'message' => 'Ubicación eliminada correctamente.'
        ], 204);
    }
}
