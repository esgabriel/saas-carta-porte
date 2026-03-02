<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartaPorte;
use App\Models\Viaje;
use App\Services\FacturapiService;
use App\Services\TenantContext;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Log;

class CartaPorteController extends Controller
{
    protected string $tenantId;
    protected FacturapiService $facturapiService;

    public function __construct(TenantContext $tenantContext, FacturapiService $facturapiService)
    {
        $this->tenantId = $tenantContext->getTenantId();
        $this->facturapiService = $facturapiService;
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
     * Store a newly created resource in storage (Timbrado de Viaje).
     */
    public function store(Request $request)
    {
        $request->validate([
            'viaje_id' => 'required|uuid|exists:viajes,id'
        ]);

        $viajeId = $request->input('viaje_id');

        // Buscar Viaje validando que pertenece al tenant (gracias a GlobalScope)
        $viaje = Viaje::with([
            'cliente',
            'vehiculo',
            'operador',
            'remolque',
            'ubicacionOrigen',
            'ubicacionDestino',
            'mercancias'
        ])->findOrFail($viajeId);

        // Verificar si este viaje ya fue timbrado o está en proceso
        if ($viaje->estatus === 'timbrado' || CartaPorte::where('viaje_id', $viajeId)->where('estatus', 'timbrado')->exists()) {
            return response()->json([
                'message' => 'Este viaje ya cuenta con una Carta Porte timbrada.'
            ], 422);
        }

        // Crear/Actualizar registro de CartaPorte a estado Pendiente/Error previo
        $cartaPorte = CartaPorte::firstOrCreate(
        ['viaje_id' => $viajeId],
        ['tenant_id' => $this->tenantId]
        );

        try {
            // Llamar al servicio adaptador a Facturapi
            $facturacionResponse = $this->facturapiService->timbrarViaje($viaje);

            // Actualizamos la base de datos si fue exitoso
            $cartaPorte->update([
                'facturapi_id' => $facturacionResponse['id'] ?? null,
                'uuid_timbrado' => $facturacionResponse['uuid'] ?? null,
                'estatus' => 'timbrado',
                'xml_url' => $facturacionResponse['verification_url'] ?? null, // Simplificado, usualmente la URL de descarga viene en la respuesta o se llama endpint de descarga
                'pdf_url' => null, // Dejemos nulo para un ejemplo basico
                'fecha_timbrado' => now(),
                'error_detalle' => null
            ]);

            // Actualizamos estatus del viaje
            $viaje->update(['estatus' => 'timbrado']);

            return response()->json([
                'message' => 'Carta Porte timbrada exitosamente.',
                'data' => $cartaPorte
            ], 201);

        }
        catch (Exception $e) {
            // Log the error detailed info
            Log::error("Error timbrando viaje {$viajeId}: " . $e->getMessage());

            // Actualizar el status de error
            $cartaPorte->update([
                'estatus' => 'error',
                'error_detalle' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al procesar el timbrado con el SAT.',
                'error_detalle' => $e->getMessage()
            ], 422);
        }
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
