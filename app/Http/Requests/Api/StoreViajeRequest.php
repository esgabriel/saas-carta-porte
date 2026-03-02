<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\TenantContext;

class StoreViajeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = app(TenantContext::class)->getTenantId();

        // Closure reutilizable para asegurar que la FK pertenezca al tenant del request actual
        $tenantExistsRule = function ($table) use ($tenantId) {
            return Rule::exists($table, 'id')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                }
                );
            };

        return [
            // FKs de Viajes
            'cliente_id' => ['required', 'uuid', $tenantExistsRule('clientes')],
            'vehiculo_id' => ['required', 'uuid', $tenantExistsRule('vehiculos')],
            'operador_id' => ['required', 'uuid', $tenantExistsRule('operadores')],
            'remolque_id' => ['nullable', 'uuid', $tenantExistsRule('remolques')],
            // La misma ubicación puede ser origen o destino en varios viajes, por ende apuntamos ambas de la misma tabla
            'ubicacion_origen_id' => ['required', 'uuid', $tenantExistsRule('ubicaciones')],
            'ubicacion_destino_id' => ['required', 'uuid', $tenantExistsRule('ubicaciones')],
            // Fechas
            'fecha_hora_salida' => ['required', 'date'],
            'fecha_hora_llegada_est' => ['nullable', 'date', 'after_or_equal:fecha_hora_salida'],
            'distancia_recorrida' => ['nullable', 'numeric', 'min:0'],
            'estatus' => [
                'nullable',
                'string',
                Rule::in(['borrador', 'en_proceso', 'timbrado', 'cancelado']),
            ],

            // -----------------------------------------------------------------
            // Nested validation array para las Mercancías. Al menos debe haber 1
            // -----------------------------------------------------------------
            'mercancias' => ['required', 'array', 'min:1'],
            'mercancias.*.clave_prod_stcc' => ['required', 'string', 'max:10'],
            'mercancias.*.descripcion' => ['required', 'string', 'max:1000'],
            'mercancias.*.cantidad' => ['required', 'numeric', 'min:0'],
            'mercancias.*.clave_unidad' => ['required', 'string', 'max:10'],
            'mercancias.*.unidad' => ['nullable', 'string', 'max:50'],
            'mercancias.*.dimensiones' => ['nullable', 'string', 'max:100'],
            'mercancias.*.material_peligroso' => ['boolean'],
            'mercancias.*.cve_material_peligroso' => ['nullable', 'string', 'max:10', 'required_if:mercancias.*.material_peligroso,true'],
            'mercancias.*.embalaje' => ['nullable', 'string', 'max:10'],
            'mercancias.*.peso_en_kg' => ['required', 'numeric', 'min:0'],
            'mercancias.*.valor_mercancia' => ['nullable', 'numeric', 'min:0'],
            'mercancias.*.moneda' => ['nullable', 'string', 'max:3'],
        ];
    }
}
