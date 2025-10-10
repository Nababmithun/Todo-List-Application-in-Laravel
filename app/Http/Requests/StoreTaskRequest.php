<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // এখন অথ লাগছে না
    }

    public function rules(): array
    {
        return [
            'title'       => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'due_date'    => ['nullable','date'],
            'priority'    => ['nullable','integer','between:1,5'],
            'is_completed'=> ['nullable','boolean'],
        ];
    }
}
