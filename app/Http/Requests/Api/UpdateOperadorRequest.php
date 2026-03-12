<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOperadorRequest extends FormRequest
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
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'rfc' => ['sometimes', 'required', 'string', 'regex:/^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[A-Z0-9A]$/i'],
            'curp' => ['sometimes', 'required', 'string', 'max:18'],
            'num_licencia' => ['sometimes', 'required', 'string', 'max:50'],
            'tipo_licencia' => ['sometimes', 'required', 'string', 'max:10'],
            'vigencia_licencia' => ['sometimes', 'nullable', 'date'],
            'calle'         => ['sometimes', 'nullable', 'string', 'max:255'],
            'municipio'     => ['sometimes', 'nullable', 'string', 'max:255'],
            'estado'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'codigo_postal' => ['sometimes', 'nullable', 'string', 'max:10'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
