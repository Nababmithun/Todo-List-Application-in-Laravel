<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['user_id','name','description'];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Scope: filter by owner user_id
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: simple search by name
     */
    public function scopeSearch(Builder $query, ?string $q): Builder
    {
        if ($q) {
            $query->where('name', 'like', "%{$q}%");
        }
        return $query;
    }

    /**
     * Auto-fill user_id on creating if missing and auth present
     */
    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (is_null($project->user_id) && auth()->check()) {
                $project->user_id = auth()->id();
            }
        });
    }
}
