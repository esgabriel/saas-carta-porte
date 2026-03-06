<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUbicacionRequest extends FormRequest
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
            'alias' => ['nullable', 'string', 'max:100'],
            'tipo' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['Origen', 'Destino', 'Intermedio']),
            ],
            'rfc_remitente' => ['nullable', 'string', 'max:13'],
            'nombre_remitente' => ['nullable', 'string', 'max:255'],
            'calle' => ['nullable', 'string', 'max:255'],
            'num_exterior' => ['nullable', 'string', 'max:20'],
            'num_interior' => ['nullable', 'string', 'max:20'],
            'colonia' => ['nullable', 'string', 'max:100'],
            'municipio' => ['sometimes', 'required', 'string', 'max:100'],
            'estado' => ['sometimes', 'required', 'string', 'max:5'],
            'pais' => ['nullable', 'string', 'size:3'],
            'codigo_postal' => ['sometimes', 'required', 'string', 'regex:/^[0-9]{5}$/'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
