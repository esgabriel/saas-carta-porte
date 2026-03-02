<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreOperadorRequest;
use App\Http\Requests\Api\UpdateOperadorRequest;
use App\Models\Operador;
use App\Services\TenantContext;

class OperadorController extends Controller
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
        $operadores = Operador::all();
        return response()->json(['data' => $operadores]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOperadorRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantId;

        $operador = Operador::create($data);

        return response()->json([
            'message' => 'Operador creado correctamente.',
            'data' => $operador
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Operador $operadore)
    {
        return response()->json(['data' => $operadore]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOperadorRequest $request, Operador $operadore)
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
    public function destroy(Operador $operadore)
    {
        $operadore->delete();

        return response()->json([
            'message' => 'Operador eliminado correctamente.'
        ], 204);
    }
}
