<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreUbicacionRequest;
use App\Http\Requests\Api\UpdateUbicacionRequest;
use App\Models\Ubicacion;
use App\Services\TenantContext;

class UbicacionController extends Controller
{
    public function __construct(protected TenantContext $tenantContext)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => Ubicacion::all()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUbicacionRequest $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantContext->getTenantId();

        $ubicacion = Ubicacion::create($data);

        return response()->json([
            'message' => 'Ubicación creada correctamente.',
            'data' => $ubicacion
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ubicacion $ubicasione): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $ubicasione]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUbicacionRequest $request, Ubicacion $ubicasione): \Illuminate\Http\JsonResponse
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
    public function destroy(Ubicacion $ubicasione): \Illuminate\Http\JsonResponse
    {
        $ubicasione->delete();

        return response()->json(null, 204);
    }
}
