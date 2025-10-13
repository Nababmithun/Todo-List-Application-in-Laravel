<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminSummaryController extends Controller
{
    /**
     * GET /api/admin/summary
     * Admin dashboard summary numbers
     */
    public function show(Request $request)
    {
        $today = Carbon::today(config('app.timezone'));

        $totals = [
            'users'    => User::count(),
            'projects' => Project::count(),
            'tasks'    => Task::count(),
        ];

        $todayCompleted = Task::whereNotNull('completed_at')
            ->whereDate('completed_at', $today)
            ->count();

        $pendingCount   = Task::where('is_completed', false)->count();
        $completedCount = Task::where('is_completed', true)->count();

        // (optional) small recent snapshots
        $recent = [
            'users'    => User::select('id','name','email','is_admin')->latest()->take(5)->get(),
            'projects' => Project::select('id','user_id','name')->with('user:id,name')->latest()->take(5)->get(),
            'tasks'    => Task::select('id','user_id','project_id','title','is_completed','due_date')
                                ->with(['user:id,name','project:id,name'])
                                ->latest()->take(5)->get(),
        ];

        return response()->json([
            'totals'          => $totals,
            'today_completed' => $todayCompleted,
            'pending_count'   => $pendingCount,
            'completed_count' => $completedCount,
            'recent'          => $recent,
        ]);
    }

    /**
     * GET /api/admin/tree
     * users -> projects (with tasks_total / done / pending)
     */
    public function tree(Request $request)
    {
        $users = User::select('id','name','email','is_admin')
            ->with(['projects' => function($q){
                $q->select('id','user_id','name')
                  ->withCount([
                      'tasks as tasks_total',
                      'tasks as tasks_done'    => function($t){ $t->where('is_completed', true); },
                      'tasks as tasks_pending' => function($t){ $t->where('is_completed', false); },
                  ]);
            }])
            ->orderBy('is_admin','desc')
            ->orderByDesc('id')
            ->get();

        return response()->json(['users' => $users]);
    }
}
