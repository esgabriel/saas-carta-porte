<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehiculoRequest extends FormRequest
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
            'placa' => ['sometimes', 'required', 'string', 'regex:/^[A-Z0-9]+$/', 'max:15'],
            'anio_modelo' => ['sometimes', 'required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'config_vehicular' => ['sometimes', 'required', 'string', 'max:10'],
            'peso_bruto_vehicular' => ['sometimes', 'required', 'numeric', 'min:0'],
            'tipo_permiso_sct' => ['sometimes', 'required', 'string', 'max:50'],
            'num_permiso_sct' => ['sometimes', 'required', 'string', 'max:100'],
            'num_serie' => ['nullable', 'string', 'max:50'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
