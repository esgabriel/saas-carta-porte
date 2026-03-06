<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreMercanciaRequest extends FormRequest
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
        return [
            'viaje_id' => ['required', 'exists:viajes,id'],
            'clave_prod_stcc' => ['required', 'string', 'max:10'],
            'descripcion' => ['required', 'string', 'max:1000'],
            'cantidad' => ['required', 'numeric', 'min:0'],
            'clave_unidad' => ['required', 'string', 'max:5'],
            'unidad' => ['nullable', 'string', 'max:50'],
            'dimensiones' => ['nullable', 'string', 'max:50'],
            'material_peligroso' => ['sometimes', 'boolean'],
            'cve_material_peligroso' => ['required_if:material_peligroso,true', 'nullable', 'string', 'max:5'],
            'embalaje' => ['nullable', 'string', 'max:50'],
            'peso_en_kg' => ['required', 'numeric', 'min:0'],
            'valor_mercancia' => ['nullable', 'numeric', 'min:0'],
            'moneda' => ['nullable', 'string', 'max:3'],
        ];
    }
}
