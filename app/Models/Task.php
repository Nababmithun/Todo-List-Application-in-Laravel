<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class Task extends Model
{
    use HasFactory;

    // Priority constants
    public const PRIORITY_LOW    = 0;
    public const PRIORITY_MEDIUM = 1;
    public const PRIORITY_HIGH   = 2;

    protected $fillable = [
        'user_id',
        'project_id',
        'title',
        'description',
        'priority',       // tinyint: 0=low,1=medium,2=high
        'due_date',
        'remind_at',
        'category',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'due_date'     => 'datetime',
        'remind_at'    => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relations
    public function user()     { return $this->belongsTo(User::class); }
    public function project()  { return $this->belongsTo(Project::class); }
    public function subtasks() { return $this->hasMany(Subtask::class); }

    /**
     * Accessor/Mutator: priority ⇄ label
     * get: 0|1|2 -> low|medium|high
     * set: low|medium|high or 0|1|2 -> 0|1|2
     */
    protected function priority(): Attribute
    {
        return Attribute::make(
            get: function ($v) {
                return [0 => 'low', 1 => 'medium', 2 => 'high'][$v] ?? 'medium';
            },
            set: function ($v) {
                $map = [
                    'low' => 0, 'medium' => 1, 'high' => 2,
                    0 => 0, 1 => 1, 2 => 2, '0' => 0, '1' => 1, '2' => 2,
                ];
                return $map[$v] ?? 1;
            }
        );
    }

    /**
     * Scope: owner
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: simple text search on title/description
     */
    public function scopeSearch(Builder $query, ?string $q): Builder
    {
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }
        return $query;
    }

    /**
     * Scope: project/category/priority/completed filters
     */
    public function scopeFilters(Builder $query, array $filters): Builder
    {
        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (array_key_exists('is_completed', $filters) && $filters['is_completed'] !== null) {
            $query->where('is_completed', filter_var($filters['is_completed'], FILTER_VALIDATE_BOOLEAN));
        }
        if (!empty($filters['priority'])) {
            // priority accepts 'low'|'medium'|'high' or 0|1|2 — mutator will handle
            $query->where('priority', ['low'=>0,'medium'=>1,'high'=>2][$filters['priority']] ?? $filters['priority']);
        }
        return $query;
    }

    /**
     * Scope: due date between (YYYY-MM-DD … YYYY-MM-DD)
     */
    public function scopeDueBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from) $query->whereDate('due_date', '>=', $from);
        if ($to)   $query->whereDate('due_date', '<=', $to);
        return $query;
    }

    /**
     * Scope: default ordering (pending first → earlier due first → newest last)
     */
    public function scopeSmartOrder(Builder $query): Builder
    {
        return $query->orderBy('is_completed') // pending first
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC')
            ->orderBy('due_date')
            ->orderByDesc('id');
    }

    /**
     * Helper: is task overdue (and not completed)?
     */
    public function getIsOverdueAttribute(): bool
    {
        return !$this->is_completed
            && !is_null($this->due_date)
            && Carbon::now()->greaterThan($this->due_date);
    }

    /**
     * Helper: mark as complete/incomplete
     */
    public function markComplete(): void
    {
        $this->is_completed = true;
        $this->completed_at = now();
        $this->save();
    }

    public function markIncomplete(): void
    {
        $this->is_completed = false;
        $this->completed_at = null;
        $this->save();
    }

    /**
     * Auto-fill user_id on creating if missing and auth present
     */
    protected static function booted(): void
    {
        static::creating(function (Task $task) {
            if (is_null($task->user_id) && auth()->check()) {
                $task->user_id = auth()->id();
            }
        });
    }
}
