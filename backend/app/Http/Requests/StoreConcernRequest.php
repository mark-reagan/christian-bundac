<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['faculty', 'outsider', 'staff'], true);
    }

    public function rules(): array
    {
        return ['equipment_id' => ['required', 'exists:equipment,id'], 'equipment_transaction_id' => ['nullable', Rule::exists('equipment_transactions', 'id')->where(fn ($query) => $query->where('equipment_id', $this->input('equipment_id')))], 'description' => ['required', 'string'], 'severity' => ['required', 'in:minor,major,critical']];
    }
}
