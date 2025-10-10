<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubtaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => ['sometimes','required','string','max:255'],
            'description'  => ['sometimes','nullable','string'],
            'due_date'     => ['sometimes','nullable','date'],
            'priority'     => ['sometimes','nullable','integer','between:1,5'],
            'is_completed' => ['sometimes','boolean'],
        ];
    }
}
