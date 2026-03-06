<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreRemolqueRequest;
use App\Http\Requests\Api\UpdateRemolqueRequest;
use App\Models\Remolque;
use App\Services\TenantContext;

class RemolqueController extends Controller
{
    public function __construct(protected TenantContext $tenantContext)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => Remolque::all()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRemolqueRequest $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantContext->getTenantId();

        $remolque = Remolque::create($data);

        return response()->json([
            'message' => 'Remolque creado correctamente.',
            'data' => $remolque
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Remolque $remolque): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $remolque]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRemolqueRequest $request, Remolque $remolque): \Illuminate\Http\JsonResponse
    {
        $remolque->update($request->validated());

        return response()->json([
            'message' => 'Remolque actualizado correctamente.',
            'data' => $remolque
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Remolque $remolque): \Illuminate\Http\JsonResponse
    {
        $remolque->delete();

        return response()->json(null, 204);
    }
}
