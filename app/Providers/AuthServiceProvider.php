<?php

namespace App\Providers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * যদি পরে Model Policy ব্যবহার করতে চান তাহলে এখানে ম্যাপ করুন।
     * উদাহরণ: Project::class => ProjectPolicy::class,
     */
    protected $policies = [
        // Project::class => \App\Policies\ProjectPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // --- Admin gate ---
        Gate::define('isAdmin', fn (User $user) => (bool) $user->is_admin);

        // --- Project can view (owner OR member OR admin) ---
        Gate::define('project.view', function (User $user, Project $project): bool {
            if ($user->is_admin) {
                return true;
            }
            if ((int) $project->user_id === (int) $user->id) {
                return true; // owner
            }
            // member?
            return $project->members()->whereKey($user->id)->exists();
        });

        // --- Project can manage (owner OR admin) ---
        Gate::define('project.manage', function (User $user, Project $project): bool {
            if ($user->is_admin) {
                return true;
            }
            return (int) $project->user_id === (int) $user->id;
        });
    }
}
