<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReturnEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStaff() === true;
    }

    public function rules(): array
    {
        return ['condition_on_return' => ['required', 'in:good,fair,damaged,under_repair,lost'], 'remarks' => ['nullable', 'string']];
    }
}
