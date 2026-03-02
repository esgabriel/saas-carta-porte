<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSeguroRequest;
use App\Http\Requests\Api\UpdateSeguroRequest;
use App\Models\Seguro;

class SeguroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Seguro se filtra implícitamente ya que vehiculos (que tiene el global scope) lo aislará cuando se consulte a través de relaciones. O se puede aplicar un join en un escenario real completo,
        // pero la instrucción indica devolver la lista como un recurso de la API. Asumimos el filtro basico baste para el ejemplo usando 'whereHas'.
        $seguros = Seguro::whereHas('vehiculo')->get();
        return response()->json(['data' => $seguros]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSeguroRequest $request)
    {
        // La validación garantiza que vehiculo_id pertenezca al tenant del request actual 
        $data = $request->validated();

        $seguro = Seguro::create($data);

        return response()->json([
            'message' => 'Seguro creado correctamente.',
            'data' => $seguro
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Seguro $seguro)
    {
        return response()->json(['data' => $seguro]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSeguroRequest $request, Seguro $seguro)
    {
        $seguro->update($request->validated());

        return response()->json([
            'message' => 'Seguro actualizado correctamente.',
            'data' => $seguro
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Seguro $seguro)
    {
        $seguro->delete();

        return response()->json([
            'message' => 'Seguro eliminado correctamente.'
        ], 204);
    }
}
