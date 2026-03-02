<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehiculoRequest extends FormRequest
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
            'placa' => ['required', 'string', 'max:15'],
            'anio_modelo' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'config_vehicular' => ['required', 'string', 'max:10'],
            'peso_bruto_vehicular' => ['required', 'numeric', 'min:0'],
            'tipo_permiso_sct' => ['required', 'string', 'max:50'],
            'num_permiso_sct' => ['required', 'string', 'max:100'],
            'num_serie' => ['nullable', 'string', 'max:50'],
            'activo' => ['boolean'],
        ];
    }
}
