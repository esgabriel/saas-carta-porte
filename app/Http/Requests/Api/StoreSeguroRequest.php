<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Vehiculo;
use App\Services\TenantContext;

class StoreSeguroRequest extends FormRequest
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

        return [
            'vehiculo_id' => [
                'required',
                'uuid',
                Rule::exists('vehiculos', 'id')->where(function ($query) use ($tenantId) {
            return $query->where('tenant_id', $tenantId);
        }),
            ],
            'aseguradora' => ['required', 'string', 'max:255'],
            'num_poliza' => ['required', 'string', 'max:100'],
            'tipo' => [
                'required',
                'string',
                Rule::in(['responsabilidad_civil', 'carga', 'medio_ambiente']),
            ],
            'vigencia_inicio' => ['required', 'date'],
            'vigencia_fin' => ['required', 'date', 'after_or_equal:vigencia_inicio'],
        ];
    }
}
