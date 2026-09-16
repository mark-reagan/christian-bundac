<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return ['name' => ['sometimes', 'string', 'max:255'], 'department' => ['nullable', 'string', 'max:255'], 'contact_number' => ['nullable', 'string', 'max:50'], 'password' => ['sometimes', 'string', 'min:8', 'confirmed']];
    }
}
