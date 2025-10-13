<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;

class AdminTaskController extends Controller
{
    // GET /api/admin/tasks?q=&user_id=&project_id=&is_completed=&date_from=&date_to=&per_page=
    public function index(Request $request)
    {
        $q         = $request->string('q')->toString();
        $per       = (int) $request->input('per_page', 15);
        $userId    = $request->input('user_id');
        $projectId = $request->input('project_id');
        $completed = $request->input('is_completed');
        $dateFrom  = $request->input('date_from');  // YYYY-MM-DD
        $dateTo    = $request->input('date_to');    // YYYY-MM-DD

        $rows = Task::with(['user:id,name,email','project:id,name'])
            ->when($q, fn($qr)=>$qr->where(function($sub) use($q){
                $sub->where('title','like',"%{$q}%")
                    ->orWhere('description','like',"%{$q}%");
            }))
            ->when($userId,    fn($qr)=>$qr->where('user_id',$userId))
            ->when($projectId, fn($qr)=>$qr->where('project_id',$projectId))
            ->when(!is_null($completed), fn($qr)=>$qr->where('is_completed', filter_var($completed, FILTER_VALIDATE_BOOLEAN)))
            ->when($dateFrom, fn($qr)=>$qr->whereDate('due_date', '>=', $dateFrom))
            ->when($dateTo,   fn($qr)=>$qr->whereDate('due_date', '<=', $dateTo))
            ->orderBy('is_completed')
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC')
            ->orderBy('due_date')
            ->orderByDesc('id')
            ->paginate($per)
            ->appends($request->query());

        return response()->json($rows);
    }

    // GET /api/admin/projects/{project}/tasks?is_completed=&date_from=&date_to=&per_page=
    public function byProject(Request $request, Project $project)
    {
        $per       = (int) $request->input('per_page', 20);
        $completed = $request->input('is_completed');
        $dateFrom  = $request->input('date_from');
        $dateTo    = $request->input('date_to');

        $rows = Task::where('project_id', $project->id)
            ->with(['user:id,name,email','project:id,name'])
            ->when(!is_null($completed), fn($qr)=>$qr->where('is_completed', filter_var($completed, FILTER_VALIDATE_BOOLEAN)))
            ->when($dateFrom, fn($qr)=>$qr->whereDate('due_date', '>=', $dateFrom))
            ->when($dateTo,   fn($qr)=>$qr->whereDate('due_date', '<=', $dateTo))
            ->orderBy('is_completed')
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC')
            ->orderBy('due_date')
            ->orderByDesc('id')
            ->paginate($per)
            ->appends($request->query());

        return response()->json($rows);
    }

    public function toggleComplete(Task $task)
    {
        $task->is_completed = !$task->is_completed;
        $task->completed_at = $task->is_completed ? now() : null;
        $task->save();
        return response()->json($task->load(['user:id,name,email','project:id,name']));
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }
}
