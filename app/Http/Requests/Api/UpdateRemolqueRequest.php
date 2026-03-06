<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRemolqueRequest extends FormRequest
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
            'subtipo_rem' => ['sometimes', 'required', 'string', 'max:10'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
