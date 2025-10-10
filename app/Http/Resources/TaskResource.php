<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'  => $this->description,
            'is_completed' => $this->is_completed,
            'completed_at' => optional($this->completed_at)?->toISOString(),
            'due_date'     => $this->due_date?->format('Y-m-d'),
            'priority'     => $this->priority,
            'created_at'   => $this->created_at?->toISOString(),
            'updated_at'   => $this->updated_at?->toISOString(),

            // যদি before থেকে যোগ করে থাকো:
            // 'subtasks_count'       => $this->when(isset($this->subtasks_count), $this->subtasks_count),
            // 'done_subtasks_count'  => $this->when(isset($this->done_subtasks_count), $this->done_subtasks_count),
        ];
    }
}
