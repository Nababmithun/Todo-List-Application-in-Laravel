<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Mass-assignable fields.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'mobile',
        'gender',
        'avatar_path',
        'is_admin',
    ];

    /**
     * Hidden fields for arrays / JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin'          => 'boolean',
        // Do NOT use 'hashed' cast here to avoid double hashing issues.
    ];

    /**
     * Always append avatar_url to JSON responses.
     */
    protected $appends = ['avatar_url'];

    /**
     * =========================
     * Relationships
     * =========================
     */

    // Projects CREATED by this user (owner column on projects table)
    public function projectsOwned()
    {
        return $this->hasMany(Project::class, 'user_id');
    }

    // Collaboration: projects where this user is a member (or owner in pivot)
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->withPivot(['role']) // owner | member
            ->withTimestamps();
    }

    // Tasks created/owned by this user (if tasks table has user_id)
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // Tasks assigned to this user (if you added tasks.assignee_id)
    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }

    /**
     * =========================
     * Mutators & Accessors
     * =========================
     */

    // Auto-hash password when setting (but don't re-hash if already hashed)
    protected function password(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if (!$value) return $this->password;

                // If it already looks like a bcrypt hash, keep as-is
                if (is_string($value) && strlen($value) === 60 && str_starts_with($value, '$2y$')) {
                    return $value;
                }

                return Hash::make($value);
            },
        );
    }

    // Computed avatar URL
    public function getAvatarUrlAttribute(): string
    {
        if (!empty($this->avatar_path)) {
            return asset('storage/' . ltrim($this->avatar_path, '/'));
        }
        $seed = urlencode($this->name ?: $this->email ?: 'U');
        return "https://api.dicebear.com/9.x/initials/svg?seed={$seed}";
    }

    /**
     * =========================
     * Helpers
     * =========================
     */

    // Is this user the owner of a given project?
    public function isOwnerOf(Project $project): bool
    {
        if ((int) $project->user_id === (int) $this->id) return true;

        // If you’re also marking owner in pivot, keep this true as well:
        return $project->members()
            ->wherePivot('role', 'owner')
            ->whereKey($this->id)
            ->exists();
    }

    // Is this user a member (collaborator) of a given project?
    public function isMemberOf(Project $project): bool
    {
        if ((int) $project->user_id === (int) $this->id) return true; // owner is effectively a member
        return $project->members()->whereKey($this->id)->exists();
    }
}
