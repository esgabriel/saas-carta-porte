<?php

namespace App\Services;

use App\Models\Viaje;
use Illuminate\Support\Facades\Http;
use Exception;

class FacturapiService
{
    protected string $baseUrl = 'https://www.facturapi.io/v2';

    /**
     * Envía la estructura JSON a Facturapi para crear y timbrar el CFDI de Ingreso con Carta Porte.
     *
     * @param Viaje $viaje Ojecto viaje ya cargado con su relaciones (cliente, vehiculo, operador, mercancias, etc.)
     * @return array Respuesta parseada de la API de Facturapi
     * @throws Exception Si la llamada HTTP falla o la API retorna error
     */
    public function timbrarViaje(Viaje $viaje): array
    {
        // 1. Obtener el API Key descifrado del Tenant asociado al Viaje
        $apiKey = $viaje->tenant->api_key_facturapi;

        if (!$apiKey) {
            throw new Exception("El tenant no tiene configurada una API Key de Facturapi.");
        }

        // 2. Construir el payload masivo para Facturapi (CFDI Ingreso + Complemento Carta Porte)
        // Nota: Esta estructura es un mapeo básico de demostración según la doc de Facturapi para Carta Porte 3.0/3.1
        $payload = [
            'type' => 'I', // CFDI de Ingreso
            'customer' => [
                'legal_name' => $viaje->cliente->nombre_razon_social,
                'tax_id' => $viaje->cliente->rfc,
                'tax_system' => $viaje->cliente->regimen_fiscal,
                'email' => $viaje->cliente->correo,
                // Facturapi requiere zip del receiver para 4.0
                'address' => [
                    'zip' => '00000' // En un entorno real se obtendría de la dir del cliente o ubicacion
                ]
            ],
            // Usos CFDI, Moneda, etc...
            'use' => $viaje->cliente->uso_cfdi ?? 'S01',

            // Items factura (Servicio de transporte cobrado) - Simplificado
            'items' => [
                [
                    'quantity' => 1,
                    'product' => [
                        'description' => 'Servicios de transporte de carga',
                        'product_key' => '78101802', // Flete
                        'price' => 10000, // Costo genérico del ejemplo
                        'unit_key' => 'E48' // Unidad de servicio
                    ]
                ]
            ],

            // Complemento Carta Porte
            'complements' => [
                [
                    'type' => 'carta_porte',
                    'data' => [
                        'transp_internac' => 'No',
                        'total_dist_rec' => $viaje->distancia_recorrida,

                        'ubicaciones' => $this->mapUbicaciones($viaje),
                        'mercancias' => $this->mapMercancias($viaje),
                        'figura_transporte' => $this->mapFiguraTransporte($viaje)
                    ]
                ]
            ]
        ];

        // 3. Ejecutar la llamada a la API
        $response = Http::withToken($apiKey)
            ->post("{$this->baseUrl}/invoices", $payload);

        // 4. Manejar errores HTTP (4xx, 5xx devueltos por Facturapi)
        if ($response->failed()) {
            $errorData = $response->json();
            $errorMessage = $errorData['message'] ?? $response->body();
            throw new Exception("Error al timbrar en Facturapi: " . $errorMessage);
        }

        return $response->json();
    }

    private function mapUbicaciones(Viaje $viaje): array
    {
        $origen = $viaje->ubicacionOrigen;
        $destino = $viaje->ubicacionDestino;

        return [
            [
                'tipo_ubicacion' => 'Origen',
                'rfc_remitente_destinatario' => $origen->rfc_remitente,
                'nombre_remitente_destinatario' => $origen->nombre_remitente,
                'fecha_hora_salida_llegada' => $viaje->fecha_hora_salida->format('Y-m-d\TH:i:s'),
                'domicilio' => [
                    'calle' => $origen->calle,
                    'estado' => $origen->estado,
                    'pais' => $origen->pais,
                    'codigo_postal' => $origen->codigo_postal,
                ]
            ],
            [
                'tipo_ubicacion' => 'Destino',
                'distancia_recorrida' => $viaje->distancia_recorrida,
                'fecha_hora_salida_llegada' => $viaje->fecha_hora_llegada_est->format('Y-m-d\TH:i:s'),
                'domicilio' => [
                    'calle' => $destino->calle,
                    'estado' => $destino->estado,
                    'pais' => $destino->pais,
                    'codigo_postal' => $destino->codigo_postal,
                ]
            ]
        ];
    }

    private function mapMercancias(Viaje $viaje): array
    {
        $pesoBrutoTotal = 0;
        $numTotalMercancias = $viaje->mercancias->count();
        $mercanciasArray = [];

        foreach ($viaje->mercancias as $mercancia) {
            $pesoBrutoTotal += $mercancia->peso_en_kg;
            $mercanciasArray[] = [
                'bienes_transp' => $mercancia->clave_prod_stcc,
                'descripcion' => $mercancia->descripcion,
                'cantidad' => $mercancia->cantidad,
                'clave_unidad' => $mercancia->clave_unidad,
                'peso_en_kg' => $mercancia->peso_en_kg,
                'valor_mercancia' => $mercancia->valor_mercancia,
                'moneda' => $mercancia->moneda,
                'material_peligroso' => $mercancia->material_peligroso ? 'Sí' : 'No',
                'cve_material_peligroso' => $mercancia->cve_material_peligroso,
            ];
        }

        return [
            'peso_bruto_total' => $pesoBrutoTotal,
            'unidad_peso' => 'KGM',
            'num_total_mercancias' => $numTotalMercancias,
            'mercancia' => $mercanciasArray,
            'autotransporte' => [
                'perm_sct' => $viaje->vehiculo->tipo_permiso_sct,
                'num_permiso_sct' => $viaje->vehiculo->num_permiso_sct,
                'identificacion_vehicular' => [
                    'config_vehicular' => $viaje->vehiculo->config_vehicular,
                    'placa_vm' => $viaje->vehiculo->placa,
                    'anio_modelo_vm' => $viaje->vehiculo->anio_modelo,
                ],
                // El SAT pide póliza de seguro mínimo de Responsabilidad Civil. Mapendo hardcodeado para el ejemplo
                'seguros' => [
                    'asegura_resp_civil' => 'Seguros XYZ', // Simplificado. En un escenario real vendria de $viaje->vehiculo->seguros
                    'poliza_resp_civil' => '123456789'
                ],
                'remolques' => $viaje->remolque ? [
                    [
                        'sub_tipo_rem' => $viaje->remolque->subtipo_rem,
                        'placa' => $viaje->remolque->placa,
                    ]
                ] : []
            ]
        ];
    }

    private function mapFiguraTransporte(Viaje $viaje): array
    {
        $operador = $viaje->operador;
        return [
            [
                'tipo_figura' => '01', // Operador
                'rfc_figura' => $operador->rfc,
                'num_licencia' => $operador->num_licencia,
                'nombre_figura' => $operador->nombre,
            ]
        ];
    }
}
