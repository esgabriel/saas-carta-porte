<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\TenantContext;

class UpdateViajeRequest extends FormRequest
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

        $tenantExistsRule = function ($table) use ($tenantId) {
            return Rule::exists($table, 'id')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                }
                );
            };

        return [
            // FKs
            'cliente_id' => ['sometimes', 'required', 'uuid', $tenantExistsRule('clientes')],
            'vehiculo_id' => ['sometimes', 'required', 'uuid', $tenantExistsRule('vehiculos')],
            'operador_id' => ['sometimes', 'required', 'uuid', $tenantExistsRule('operadores')],
            'remolque_id' => ['nullable', 'uuid', $tenantExistsRule('remolques')],
            'ubicacion_origen_id' => ['sometimes', 'required', 'uuid', $tenantExistsRule('ubicaciones')],
            'ubicacion_destino_id' => ['sometimes', 'required', 'uuid', $tenantExistsRule('ubicaciones')],
            // Fechas
            'fecha_hora_salida' => ['sometimes', 'required', 'date'],
            'fecha_hora_llegada_est' => ['nullable', 'date', 'after_or_equal:fecha_hora_salida'],
            'distancia_recorrida' => ['nullable', 'numeric', 'min:0'],
            'precio_servicio'     => ['sometimes', 'required', 'numeric', 'min:0'],
            'estatus' => [
                'sometimes', 'required', 'string',
                Rule::in(['borrador', 'en_proceso', 'timbrado', 'cancelado']),
            ],

            // -----------------------------------------------------------------
            // Validacion anidada de Mercancias - si se proporcionan, reemplazan a las anteriores
            // -----------------------------------------------------------------
            'mercancias' => ['sometimes', 'required', 'array', 'min:1'],
            'mercancias.*.clave_prod_stcc' => ['required_with:mercancias', 'string', 'max:10'],
            'mercancias.*.descripcion' => ['required_with:mercancias', 'string', 'max:1000'],
            'mercancias.*.cantidad' => ['required_with:mercancias', 'numeric', 'min:0'],
            'mercancias.*.clave_unidad' => ['required_with:mercancias', 'string', 'max:10'],
            'mercancias.*.unidad' => ['nullable', 'string', 'max:50'],
            'mercancias.*.dimensiones' => ['nullable', 'string', 'max:100'],
            'mercancias.*.material_peligroso' => ['sometimes', 'boolean'],
            'mercancias.*.cve_material_peligroso' => ['nullable', 'string', 'max:10', 'required_if:mercancias.*.material_peligroso,true'],
            'mercancias.*.embalaje' => ['nullable', 'string', 'max:10'],
            'mercancias.*.peso_en_kg' => ['required_with:mercancias', 'numeric', 'min:0'],
            'mercancias.*.valor_mercancia' => ['nullable', 'numeric', 'min:0'],
            'mercancias.*.moneda' => ['nullable', 'string', 'max:3'],
        ];
    }
}
