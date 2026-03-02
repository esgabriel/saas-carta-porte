<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
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
            'nombre_razon_social' => ['required', 'string', 'max:255'],
            'rfc' => ['required', 'string', 'max:13'], // The max length for a legal entity RFC is 12, and 13 for physical persons.
            'regimen_fiscal' => ['required', 'string', 'max:10'],
            'uso_cfdi' => ['required', 'string', 'max:10'],
            'correo' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'activo' => ['boolean'],
        ];
    }
}
