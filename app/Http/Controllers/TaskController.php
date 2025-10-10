<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    private function ensureOwner(Task $task): void
    {
        abort_unless($task->user_id === auth()->id(), 403, 'Forbidden');
    }

    // GET /api/tasks
    public function index(Request $request)
    {
        $query = Task::query()->where('user_id', auth()->id());   // ✅ শুধুমাত্র নিজের টাস্ক

        if ($q = $request->input('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if (!is_null($request->input('is_completed'))) {
            $query->where('is_completed', filter_var($request->input('is_completed'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($from = $request->input('due_date_from')) {
            $query->whereDate('due_date', '>=', $from);
        }
        if ($to = $request->input('due_date_to')) {
            $query->whereDate('due_date', '<=', $to);
        }

        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min(100, $perPage));

        $tasks = $query->latest()->paginate($perPage)->appends($request->query());

        return TaskResource::collection($tasks);
    }

    // POST /api/tasks
    public function store(StoreTaskRequest $request)
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id();                 // ✅ owner set

        if (array_key_exists('is_completed', $data) && $data['is_completed']) {
            $data['completed_at'] = Carbon::now();
        }

        $task = Task::create($data);

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Task $task)
    {
        $this->ensureOwner($task);                        // ✅
        return new TaskResource($task);
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->ensureOwner($task);                        // ✅
        $data = $request->validated();

        if (array_key_exists('is_completed', $data)) {
            if ($data['is_completed'] && !$task->is_completed) {
                $data['completed_at'] = Carbon::now();
            } elseif (!$data['is_completed']) {
                $data['completed_at'] = null;
            }
        }

        $task->fill($data)->save();

        return new TaskResource($task);
    }

    public function destroy(Task $task)
    {
        $this->ensureOwner($task);                        // ✅
        $task->delete();
        return response()->noContent();
    }

    public function toggleComplete(Task $task)
    {
        $this->ensureOwner($task);                        // ✅
        $task->is_completed = !$task->is_completed;
        $task->completed_at = $task->is_completed ? now() : null;
        $task->save();

        return new TaskResource($task);
    }
}
