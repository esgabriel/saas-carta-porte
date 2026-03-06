<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mercancia;
use Illuminate\Http\Request;

use App\Http\Requests\Api\StoreMercanciaRequest;
use App\Http\Requests\Api\UpdateMercanciaRequest;
use App\Services\TenantContext;

class MercanciaController extends Controller
{
    public function __construct(protected TenantContext $tenantContext)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => Mercancia::all()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMercanciaRequest $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantContext->getTenantId();

        $mercancia = Mercancia::create($data);

        return response()->json([
            'message' => 'Mercancía creada correctamente.',
            'data' => $mercancia
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Mercancia $mercancia): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $mercancia]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMercanciaRequest $request, Mercancia $mercancia): \Illuminate\Http\JsonResponse
    {
        $mercancia->update($request->validated());

        return response()->json([
            'message' => 'Mercancía actualizada correctamente.',
            'data' => $mercancia
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Mercancia $mercancia): \Illuminate\Http\JsonResponse
    {
        $mercancia->delete();

        return response()->json(null, 204);
    }
}
