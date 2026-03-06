<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreClienteRequest;
use App\Http\Requests\Api\UpdateClienteRequest;
use App\Models\Cliente;
use App\Services\TenantContext;

class ClienteController extends Controller
{
    public function __construct(protected TenantContext $tenantContext)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => Cliente::all()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClienteRequest $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantContext->getTenantId();

        $cliente = Cliente::create($data);

        return response()->json([
            'message' => 'Cliente creado correctamente.',
            'data'    => $cliente,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cliente $cliente): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $cliente]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClienteRequest $request, Cliente $cliente): \Illuminate\Http\JsonResponse
    {
        $cliente->update($request->validated());

        return response()->json([
            'message' => 'Cliente actualizado correctamente.',
            'data'    => $cliente,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cliente $cliente): \Illuminate\Http\JsonResponse
    {
        $cliente->delete();

        return response()->json(null, 204);
    }
}
