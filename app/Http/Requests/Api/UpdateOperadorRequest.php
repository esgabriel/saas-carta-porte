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
            'rfc' => ['nullable', 'string', 'max:13'],
            'curp' => ['sometimes', 'required', 'string', 'max:18'],
            'num_licencia' => ['sometimes', 'required', 'string', 'max:50'],
            'tipo_licencia' => ['sometimes', 'required', 'string', 'max:10'],
            'vigencia_licencia' => ['sometimes', 'required', 'date'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
