<?php

namespace App\Models; // ✅

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subtask extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'task_id','title','description','is_completed','completed_at','due_date','priority',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'due_date'     => 'date',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
