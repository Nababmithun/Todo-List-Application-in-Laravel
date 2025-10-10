<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',        // ✅
        'title',
        'description',
        'is_completed',
        'completed_at',
        'due_date',
        'priority',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'due_date'     => 'date',
    ];

    public function user(): BelongsTo   // ✅ owner
    {
        return $this->belongsTo(User::class);
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Subtask::class);
    }
}
