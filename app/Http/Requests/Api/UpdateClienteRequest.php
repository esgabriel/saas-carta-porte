<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClienteRequest extends FormRequest
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
            'nombre_razon_social' => ['sometimes', 'required', 'string', 'max:255'],
            'rfc' => ['sometimes', 'required', 'string', 'regex:/^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[A-Z0-9A]$/i'],
            'regimen_fiscal' => ['sometimes', 'required', 'string', 'size:3'],
            'uso_cfdi' => ['sometimes', 'required', 'string', 'size:3'],
            'correo' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
