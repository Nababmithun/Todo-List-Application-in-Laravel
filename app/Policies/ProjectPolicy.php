<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool {
        return $project->members()->whereKey($user->id)->exists();
    }

    public function manageMembers(User $user, Project $project): bool {
        return $project->members()
            ->wherePivot('role', 'owner')
            ->whereKey($user->id)
            ->exists();
    }
}
