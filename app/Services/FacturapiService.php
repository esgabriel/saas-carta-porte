<?php

namespace App\Services;

use App\Models\Viaje;
use App\Contracts\FacturacionGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Exception;

class FacturapiService implements FacturacionGatewayInterface
{
    protected string $baseUrl = 'https://www.facturapi.io/v2';

    public function timbrarViaje(Viaje $viaje): array
    {
        $apiKey = $viaje->tenant->api_key_facturapi;

        if (!$apiKey) {
            throw new Exception("El tenant no tiene configurada una API Key de Facturapi.");
        }

        $payload = [
            'type'         => 'I',
            'payment_form' => '99',
            'customer'     => [
                'legal_name' => $viaje->cliente->nombre_razon_social,
                'tax_id'     => $viaje->cliente->rfc,
                'tax_system' => $viaje->cliente->regimen_fiscal,
                'email'      => $viaje->cliente->correo ?? 'sin@correo.com',
                'address'    => [
                    'zip' => '06600',
                ],
            ],
            'use'   => $viaje->cliente->uso_cfdi ?? 'S01',
            'items' => [
                [
                    'quantity' => 1,
                    'product'  => [
                        'description' => 'Servicios de transporte de carga',
                        'product_key' => '78101802',
                        'price'       => 10000,
                        'unit_key'    => 'E48',
                    ],
                ],
            ],
            'complements' => [
                [
                    'type' => 'carta_porte',
                    'data' => [
                        'IdCCP'          => (string) Str::uuid(),
                        'TranspInternac' => 'No',
                        'TotalDistRec'   => (float) ($viaje->distancia_recorrida ?? 1),
                        'Ubicaciones'    => $this->mapUbicaciones($viaje),
                        'Mercancias'     => $this->mapMercancias($viaje),
                        'FiguraTransporte' => $this->mapFiguraTransporte($viaje),
                    ],
                ],
            ],
        ];

        $response = Http::withToken($apiKey)
            ->post("{$this->baseUrl}/invoices", $payload);

        if ($response->failed()) {
            $errorData    = $response->json();
            $errorMessage = $errorData['message'] ?? $response->body();
            throw new Exception("Error al timbrar en Facturapi: " . $errorMessage);
        }

        return $response->json();
    }

    private function mapUbicaciones(Viaje $viaje): array
    {
        $origen  = $viaje->ubicacionOrigen;
        $destino = $viaje->ubicacionDestino;

        return [
            [
                'TipoUbicacion'               => 'Origen',
                'RFCRemitenteDestinatario'    => $origen->rfc_remitente ?? 'XAXX010101000',
                'NombreRemitenteDestinatario' => $origen->nombre_remitente ?? 'PUBLICO EN GENERAL',
                'FechaHoraSalidaLlegada'      => $viaje->fecha_hora_salida->format('Y-m-d\TH:i:s'),
                'Domicilio' => [
                    'Calle'        => $origen->calle ?? 'Sin calle',
                    'Estado'       => $origen->estado,
                    'Pais'         => $origen->pais ?? 'MEX',
                    'CodigoPostal' => $origen->codigo_postal,
                ],
            ],
            [
                'TipoUbicacion'               => 'Destino',
                'RFCRemitenteDestinatario'    => $destino->rfc_remitente ?? 'XAXX010101000',
                'NombreRemitenteDestinatario' => $destino->nombre_remitente ?? 'PUBLICO EN GENERAL',
                'DistanciaRecorrida'          => (float) ($viaje->distancia_recorrida ?? 1),
                'FechaHoraSalidaLlegada'      => $viaje->fecha_hora_llegada_est
                    ? $viaje->fecha_hora_llegada_est->format('Y-m-d\TH:i:s')
                    : $viaje->fecha_hora_salida->addDay()->format('Y-m-d\TH:i:s'),
                'Domicilio' => [
                    'Calle'        => $destino->calle ?? 'Sin calle',
                    'Estado'       => $destino->estado,
                    'Pais'         => $destino->pais ?? 'MEX',
                    'CodigoPostal' => $destino->codigo_postal,
                ],
            ],
        ];
    }

    private function mapMercancias(Viaje $viaje): array
    {
        $pesoBrutoTotal     = 0;
        $numTotalMercancias = $viaje->mercancias->count();
        $mercanciasArray    = [];

        foreach ($viaje->mercancias as $mercancia) {
            $pesoBrutoTotal += (float) $mercancia->peso_en_kg;

            $item = [
                'BienesTransp'   => (string) $mercancia->clave_prod_stcc,
                'Descripcion'    => (string) $mercancia->descripcion,
                'Cantidad'       => (float) $mercancia->cantidad,
                'ClaveUnidad'    => (string) $mercancia->clave_unidad,
                'PesoEnKg'       => (float) $mercancia->peso_en_kg,
                'ValorMercancia' => (float) ($mercancia->valor_mercancia ?? 0),
                'Moneda'         => (string) ($mercancia->moneda ?? 'MXN'),
                'MaterialPeligroso' => $mercancia->material_peligroso ? 'Sí' : 'No',
            ];

            if ($mercancia->material_peligroso && $mercancia->cve_material_peligroso) {
                $item['CveMaterialPeligroso'] = (string) $mercancia->cve_material_peligroso;
            }

            $mercanciasArray[] = $item;
        }

        return [
            'PesoBrutoTotal'     => (float) $pesoBrutoTotal,
            'UnidadPeso'         => 'KGM',
            'NumTotalMercancias' => (int) $numTotalMercancias,
            'Mercancia'          => $mercanciasArray,
            'Autotransporte'     => [
                'PermSCT'        => (string) $viaje->vehiculo->tipo_permiso_sct,
                'NumPermisoSCT'  => (string) $viaje->vehiculo->num_permiso_sct,
                'IdentificacionVehicular' => [
                    'ConfigVehicular'    => (string) $viaje->vehiculo->config_vehicular,
                    'PlacaVM'            => (string) $viaje->vehiculo->placa,
                    'AnioModeloVM'       => (string) $viaje->vehiculo->anio_modelo,
                    'PesoBrutoVehicular' => (float) $viaje->vehiculo->peso_bruto_vehicular,
                ],
                'Seguros'  => $this->mapSeguros($viaje),
                'Remolques' => $viaje->remolque ? [
                    [
                        'SubTipoRem' => (string) $viaje->remolque->subtipo_rem,
                        'Placa'      => (string) $viaje->remolque->placa,
                    ],
                ] : [],
            ],
        ];
    }

    private function mapFiguraTransporte(Viaje $viaje): array
    {
        $operador = $viaje->operador;
        return [
            [
                'TipoFigura'   => '01',
                'RFCFigura'    => (string) ($operador->rfc ?? 'XAXX010101000'),
                'NumLicencia'  => (string) $operador->num_licencia,
                'NombreFigura' => (string) $operador->nombre,
            ],
        ];
    }

    private function mapSeguros(Viaje $viaje): array
    {
        $seguros = $viaje->vehiculo->seguros;
        $rc      = $seguros->firstWhere('tipo', 'responsabilidad_civil');

        if (!$rc) {
            throw new Exception(
                "El vehículo con placa '{$viaje->vehiculo->placa}' no tiene póliza de " .
                "Responsabilidad Civil. El SAT la requiere para timbrar."
            );
        }

        $segurosCfdi = [
            'AseguraRespCivil' => (string) $rc->aseguradora,
            'PolizaRespCivil'  => (string) $rc->num_poliza,
        ];

        $carga = $seguros->firstWhere('tipo', 'carga');
        if ($carga) {
            $segurosCfdi['AseguraCarga'] = (string) $carga->aseguradora;
            $segurosCfdi['PolizaCarga']  = (string) $carga->num_poliza;
        }

        $medioAmbiente = $seguros->firstWhere('tipo', 'medio_ambiente');
        if ($medioAmbiente) {
            $segurosCfdi['AseguraMedAmbiente'] = (string) $medioAmbiente->aseguradora;
            $segurosCfdi['PolizaMedAmbiente']  = (string) $medioAmbiente->num_poliza;
        }

        return $segurosCfdi;
    }
}