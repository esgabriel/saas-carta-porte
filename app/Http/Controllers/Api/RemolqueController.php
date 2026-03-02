<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreRemolqueRequest;
use App\Http\Requests\Api\UpdateRemolqueRequest;
use App\Models\Remolque;
use App\Services\TenantContext;

class RemolqueController extends Controller
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
        $remolques = Remolque::all();
        return response()->json(['data' => $remolques]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRemolqueRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = $this->tenantId;

        $remolque = Remolque::create($data);

        return response()->json([
            'message' => 'Remolque creado correctamente.',
            'data' => $remolque
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Remolque $remolque)
    {
        return response()->json(['data' => $remolque]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRemolqueRequest $request, Remolque $remolque)
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
    public function destroy(Remolque $remolque)
    {
        $remolque->delete();

        return response()->json([
            'message' => 'Remolque eliminado correctamente.'
        ], 204);
    }
}
