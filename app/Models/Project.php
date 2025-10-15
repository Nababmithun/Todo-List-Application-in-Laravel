<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'description'];

    /**
     * =========================
     * Relationships
     * =========================
     */

    // Creator / Owner (column: user_id)
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Backward compatibility: $project->user
    public function user()
    {
        return $this->owner();
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // Collaboration members via pivot: project_user (project_id, user_id, role)
    public function members()
    {
        // default pivot table name = project_user (alphabetical)
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot(['role']) // 'owner' | 'member'
            ->withTimestamps();
    }

    /**
     * =========================
     * Scopes
     * =========================
     */

    // Only projects strictly owned by a user
    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    // Projects a user can see (Owner OR Member)
    public function scopeVisibleTo(Builder $query, int $userId): Builder
    {
        return $query->where(function (Builder $q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhereHas('members', function (Builder $m) use ($userId) {
                  $m->where('users.id', $userId);
              });
        });
    }

    // Simple search by name
    public function scopeSearch(Builder $query, ?string $q): Builder
    {
        if ($q) {
            $query->where('name', 'like', "%{$q}%");
        }
        return $query;
    }

    /**
     * =========================
     * Helpers
     * =========================
     */

    public function addMember(User $user, string $role = 'member'): void
    {
        $this->members()->syncWithoutDetaching([
            $user->id => ['role' => $role],
        ]);
    }

    public function removeMember(User $user): void
    {
        $this->members()->detach($user->id);
    }

    public function isMember(int $userId): bool
    {
        if ($this->user_id === $userId) {
            return true; // owner is considered visible
        }
        return $this->members()->whereKey($userId)->exists();
    }

    /**
     * Auto-fill owner on create AND attach owner to pivot as 'owner'
     */
    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (is_null($project->user_id) && auth()->check()) {
                $project->user_id = auth()->id();
            }
        });

        static::created(function (Project $project) {
            // Ensure owner appears in pivot as 'owner'
            if ($project->user_id) {
                $already = $project->members()->whereKey($project->user_id)->exists();
                if (!$already) {
                    $project->members()->attach($project->user_id, ['role' => 'owner']);
                } else {
                    // If already attached, make sure role=owner (idempotent)
                    $project->members()->updateExistingPivot($project->user_id, ['role' => 'owner']);
                }
            }
        });
    }
}
