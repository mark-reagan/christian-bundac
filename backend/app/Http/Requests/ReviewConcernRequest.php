<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        return ['status' => ['required', 'in:reviewed,resolved'], 'admin_remarks' => ['nullable', 'string'], 'update_condition' => ['nullable', 'in:good,fair,damaged,under_repair,lost']];
    }
}
