<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubtaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // task_id রুট-প্যারাম থেকে আসবে (nested route), তাই এখানে লাগছে না
            'title'        => ['required','string','max:255'],
            'description'  => ['nullable','string'],
            'due_date'     => ['nullable','date'],
            'priority'     => ['nullable','integer','between:1,5'],
            'is_completed' => ['nullable','boolean'],
        ];
    }
}
