<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplyRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'faculty';
    }

    public function rules(): array
    {
        return [
            'supply_id' => ['required', 'exists:supplies,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purpose' => ['required', 'string'],
        ];
    }
}
