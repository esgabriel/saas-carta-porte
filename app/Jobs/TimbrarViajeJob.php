<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use App\Models\Viaje;
use App\Models\CartaPorte;
use App\Contracts\FacturacionGatewayInterface;
use Illuminate\Support\Facades\Log;
use Exception;

class TimbrarViajeJob implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Viaje $viaje)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(FacturacionGatewayInterface $facturacionGateway): void
    {
        // Buscar el registro CartaPorte asociado al viaje para actualizar estatus
        $cartaPorte = CartaPorte::where('viaje_id', $this->viaje->id)->first();

        if (!$cartaPorte) {
            Log::error("TimbrarViajeJob: No se encontró CartaPorte para el Viaje {$this->viaje->id}");
            return;
        }

        try {
            // Llamar al servicio adaptador a través de la interfaz
            $facturacionResponse = $facturacionGateway->timbrarViaje($this->viaje);

            // Actualizamos la base de datos si fue exitoso
            $cartaPorte->update([
                'facturapi_id' => $facturacionResponse['id'] ?? null,
                'uuid_timbrado' => $facturacionResponse['uuid'] ?? null,
                'estatus' => 'timbrado',
                'xml_url' => $facturacionResponse['verification_url'] ?? null,
                'pdf_url' => null,
                'fecha_timbrado' => now(),
                'error_detalle' => null
            ]);

            // Actualizamos estatus del viaje
            $this->viaje->update(['estatus' => 'timbrado']);

        } catch (Exception $e) {
            // Log the error detailed info
            Log::error("Error timbrando viaje {$this->viaje->id}: " . $e->getMessage());

            // Actualizar el status de error
            $cartaPorte->update([
                'estatus' => 'error',
                'error_detalle' => $e->getMessage()
            ]);
        }
    }
}
