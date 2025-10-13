<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class AdminProjectController extends Controller
{
    // GET /api/admin/projects?q=&user_id=&per_page=
    public function index(Request $request)
    {
        $q      = $request->string('q')->toString();
        $per    = (int) $request->input('per_page', 15);
        $userId = $request->input('user_id');
        $include= $request->input('include'); // e.g. include=tasks

        $query = Project::query()
            ->with('user:id,name,email')
            ->withCount(['tasks as tasks_total'])
            ->when($q, fn($qr)=>$qr->where('name','like',"%{$q}%"))
            ->when($userId, fn($qr)=>$qr->where('user_id', $userId))
            ->orderByDesc('id');

        if ($include === 'tasks') {
            // lightweight tasks (id,title,is_completed,due_date)
            $query->with(['tasks:id,project_id,title,is_completed,due_date,priority']);
        }

        $rows = $query->paginate($per)->appends($request->query());
        return response()->json($rows);
    }

    // GET /api/admin/users/{user}/projects?include=tasks
    public function byUser(Request $request, User $user)
    {
        $include = $request->input('include');

        $query = Project::where('user_id', $user->id)
            ->with('user:id,name,email')
            ->withCount(['tasks as tasks_total'])
            ->orderByDesc('id');

        if ($include === 'tasks') {
            $query->with(['tasks:id,project_id,title,is_completed,due_date,priority']);
        }

        $rows = $query->get();
        return response()->json($rows);
    }
}
