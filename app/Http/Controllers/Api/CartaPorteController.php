<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartaPorte;
use App\Models\Viaje;
use App\Services\TenantContext;
use Illuminate\Http\Request;

class CartaPorteController extends Controller
{
    public function __construct(protected TenantContext $tenantContext)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cartasPorte = CartaPorte::with('viaje')->get();
        return response()->json(['data' => $cartasPorte]);
    }

    /**
     * Store a newly created resource in storage (Timbrado de Viaje de forma asíncrona).
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'viaje_id' => 'required|uuid|exists:viajes,id'
        ]);

        $viajeId = $request->input('viaje_id');

        // Buscar Viaje validando que pertenece al tenant (gracias a GlobalScope)
        $viaje = Viaje::with([
            'tenant',
            'cliente',
            'vehiculo.seguros',
            'operador',
            'remolque',
            'ubicacionOrigen',
            'ubicacionDestino',
            'mercancias'
        ])->findOrFail($viajeId);

        // Verificar si este viaje ya fue timbrado o está en proceso
        if ($viaje->estatus === 'timbrado' || CartaPorte::where('viaje_id', $viajeId)->whereIn('estatus', ['timbrado', 'procesando'])->exists()) {
            return response()->json([
                'message' => 'Este viaje ya está procesando una Carta Porte o ya fue timbrado.'
            ], 422);
        }

        // Crear/Actualizar registro de CartaPorte a estado Procesando
        $cartaPorte = CartaPorte::updateOrCreate(
            ['viaje_id' => $viajeId],
            [
                'tenant_id' => $this->tenantContext->getTenantId(),
                'estatus' => 'procesando',
                'error_detalle' => null
            ]
        );

        // Actualizamos estatus del viaje temporalmente si es necesario, o lo mantenemos hasta que el Job acabe
        // Despachar a la cola
        \App\Jobs\TimbrarViajeJob::dispatch($viaje);

        return response()->json([
            'message' => 'La Carta Porte se está procesando en segundo plano.',
            'data' => $cartaPorte
        ], 202);
    }

    /**
     * Display the specified resource.
     */
    public function show(CartaPorte $cartaPorte)
    {
        return response()->json(['data' => $cartaPorte]);
    }

    /**
     * Remove the specified resource from storage (Se enviaría cancelación a Facturapi).
     */
    public function destroy(CartaPorte $cartaPorte)
    {
        // En escenarios reales llamaríamos a $this->facturapiService->cancelarFactura(...)

        $cartaPorte->update([
            'estatus' => 'cancelado'
        ]);

        if ($cartaPorte->viaje) {
            $cartaPorte->viaje->update(['estatus' => 'cancelado']);
        }

        return response()->json([
            'message' => 'Carta Porte cancelada correctamente.'
        ]);
    }
}
