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
    public function show(Ubicacion $ubicacion): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $ubicacion]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUbicacionRequest $request, Ubicacion $ubicacion): \Illuminate\Http\JsonResponse
    {
        $ubicacion->update($request->validated());

        return response()->json([
            'message' => 'Ubicación actualizada correctamente.',
            'data' => $ubicacion
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * Una ubicación puede ser referenciada como origen o como destino en un
     * viaje. Sumamos ambos conteos para detectar cualquier dependencia.
     */
    public function destroy(Ubicacion $ubicacion): \Illuminate\Http\JsonResponse
    {
        $count = $ubicacion->viajesComoOrigen()->count()
               + $ubicacion->viajesComoDestino()->count();

        if ($count > 0) {
            return response()->json([
                'message'      => "Esta ubicación está referenciada en {$count} " .
                                  ($count === 1 ? 'viaje' : 'viajes') .
                                  '. Puedes desactivarla para que no aparezca en nuevos viajes.',
                'viajes_count' => $count,
            ], 409);
        }

        $ubicacion->delete();

        return response()->json(null, 204);
    }
}
