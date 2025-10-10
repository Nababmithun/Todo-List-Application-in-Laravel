<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SubtaskResource extends JsonResource
{
    // ❌ public function toArray(\Illuminate\Http\Request $request): array
    // ✅ parent signature-এর মতোই রাখো:
    public function toArray($request)
    {
        return [
            'id'           => $this->id,
            'task_id'      => $this->task_id,
            'title'        => $this->title,
            'description'  => $this->description,
            'is_completed' => $this->is_completed,
            'completed_at' => optional($this->completed_at)?->toISOString(),
            'due_date'     => $this->due_date?->format('Y-m-d'),
            'priority'     => $this->priority,
            'created_at'   => $this->created_at?->toISOString(),
            'updated_at'   => $this->updated_at?->toISOString(),
        ];
    }
}
