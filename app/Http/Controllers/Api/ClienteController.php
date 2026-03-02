<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreClienteRequest;
use App\Http\Requests\Api\UpdateClienteRequest;
use App\Models\Cliente;
use App\Services\TenantContext;

class ClienteController extends Controller
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
        $clientes = Cliente::all();
        return response()->json(['data' => $clientes]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClienteRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantId;

        $cliente = Cliente::create($data);

        return response()->json([
            'message' => 'Cliente creado correctamente.',
            'data' => $cliente
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cliente $cliente)
    {
        return response()->json(['data' => $cliente]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClienteRequest $request, Cliente $cliente)
    {
        $cliente->update($request->validated());

        return response()->json([
            'message' => 'Cliente actualizado correctamente.',
            'data' => $cliente
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cliente $cliente)
    {
        $cliente->delete();

        return response()->json([
            'message' => 'Cliente eliminado correctamente.'
        ], 204);
    }
}
