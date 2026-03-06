<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreOperadorRequest;
use App\Http\Requests\Api\UpdateOperadorRequest;
use App\Models\Operador;
use App\Services\TenantContext;

class OperadorController extends Controller
{
    public function __construct(protected TenantContext $tenantContext)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => Operador::all()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOperadorRequest $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantContext->getTenantId();

        $operador = Operador::create($data);

        return response()->json([
            'message' => 'Operador creado correctamente.',
            'data' => $operador
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Operador $operadore): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $operadore]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOperadorRequest $request, Operador $operadore): \Illuminate\Http\JsonResponse
    {
        $operadore->update($request->validated());

        return response()->json([
            'message' => 'Operador actualizado correctamente.',
            'data' => $operadore
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Operador $operadore): \Illuminate\Http\JsonResponse
    {
        $operadore->delete();

        return response()->json(null, 204);
    }
}
