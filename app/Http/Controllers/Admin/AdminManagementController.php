<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminManagementController extends Controller
{
    public function summary()
    {
        $totalUsers    = User::count();
        $totalProjects = Project::count();
        $totalTasks    = Task::count();

        $today = Carbon::today(config('app.timezone'));
        $todayCompleted = Task::whereNotNull('completed_at')
            ->whereDate('completed_at', $today)
            ->count();

        $overdue = Task::where('is_completed', false)
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->count();

        return response()->json([
            'totals' => [
                'users' => $totalUsers,
                'projects' => $totalProjects,
                'tasks' => $totalTasks,
            ],
            'today_completed' => $todayCompleted,
            'overdue' => $overdue,
        ]);
    }

    public function users(Request $request)
    {
        $q = $request->string('q')->toString();
        $items = User::query()
            ->when($q, function($qr) use ($q){
                $qr->where('name','like',"%{$q}%")
                   ->orWhere('email','like',"%{$q}%");
            })
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 20));

        return response()->json($items);
    }

    public function projects(Request $request)
    {
        $userId = $request->input('user_id');
        $q = $request->string('q')->toString();

        $items = Project::query()
            ->when($userId, fn($qr) => $qr->where('user_id', $userId))
            ->when($q, fn($qr) => $qr->where('name', 'like', "%{$q}%"))
            ->withCount('tasks')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 20));

        return response()->json($items);
    }

    public function tasks(Request $request)
    {
        $userId = $request->input('user_id');
        $projectId = $request->input('project_id');
        $q = $request->string('q')->toString();

        $items = Task::query()
            ->when($userId, fn($qr) => $qr->where('user_id', $userId))
            ->when($projectId, fn($qr) => $qr->where('project_id', $projectId))
            ->when($q, function($qr) use ($q){
                $qr->where(function($sub) use ($q){
                    $sub->where('title','like',"%{$q}%")
                        ->orWhere('description','like',"%{$q}%");
                });
            })
            ->with(['project:id,name,user_id', 'user:id,name,email'])
            ->orderBy('is_completed')
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC')
            ->orderBy('due_date')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 20));

        return response()->json($items);
    }
}
