<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUbicacionRequest extends FormRequest
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
            'municipio' => ['required', 'string', 'max:100'],
            'estado' => ['required', 'string', 'max:5'],
            'pais' => ['nullable', 'string', 'size:3'],
            'codigo_postal' => ['required', 'string', 'regex:/^[0-9]{5}$/'],
            'activo' => ['boolean'],
        ];
    }
    
    protected function prepareForValidation()
    {
        if (empty($this->pais)) {
            $this->merge(['pais' => 'MEX']);
        }
    }
}
