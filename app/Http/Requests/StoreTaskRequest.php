<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'project_id'  => ['nullable','integer','exists:projects,id'],
            'title'       => ['required','string','max:255'],
            'description' => ['nullable','string'],
            // allow both strings and ints (0,1,2)
            'priority'    => ['nullable', Rule::in(['low','medium','high', 0,1,2,'0','1','2'])],
            'due_date'    => ['nullable','date'],
            'remind_at'   => ['nullable','date'],
            'category'    => ['nullable','string','max:50'],
            'is_completed'=> ['nullable','boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Title is required.',
            'priority.in'    => 'Priority must be low, medium, high or 0/1/2.',
            'due_date.date'  => 'Due date must be a valid date/time.',
            'remind_at.date' => 'Remind at must be a valid date/time.',
        ];
    }
}
