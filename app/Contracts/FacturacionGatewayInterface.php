<?php

namespace App\Contracts;

use App\Models\Viaje;

interface FacturacionGatewayInterface
{
    /**
     * Envía la estructura para crear y timbrar el CFDI de Ingreso con Carta Porte.
     *
     * @param Viaje $viaje Ojecto viaje ya cargado con su relaciones
     * @return array Respuesta de la pasarela
     */
    public function timbrarViaje(Viaje $viaje): array;
}
