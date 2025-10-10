<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubtaskRequest;
use App\Http\Requests\UpdateSubtaskRequest;
use App\Http\Resources\SubtaskResource;
use App\Models\Subtask;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SubtaskController extends Controller
{
    private function ensureTaskOwner(Task $task): void
    {
        abort_unless($task->user_id === auth()->id(), 403, 'Forbidden');
    }

    private function ensureSubtaskOwner(Subtask $subtask): void
    {
        abort_unless($subtask->task && $subtask->task->user_id === auth()->id(), 403, 'Forbidden');
    }

    // GET /api/tasks/{task}/subtasks
    public function index(Task $task, Request $request)
    {
        $this->ensureTaskOwner($task); // ✅

        $query = $task->subtasks()->newQuery();

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

        $subtasks = $query->latest()->paginate($perPage)->appends($request->query());

        return SubtaskResource::collection($subtasks);
    }

    // POST /api/tasks/{task}/subtasks
    public function store(Task $task, StoreSubtaskRequest $request)
    {
        $this->ensureTaskOwner($task); // ✅

        $data = $request->validated();

        if (array_key_exists('is_completed', $data) && $data['is_completed']) {
            $data['completed_at'] = now();
        }

        $subtask = $task->subtasks()->create($data);

        return (new SubtaskResource($subtask))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    // GET /api/subtasks/{subtask}
    public function show(Subtask $subtask)
    {
        $subtask->loadMissing('task');
        $this->ensureSubtaskOwner($subtask); // ✅
        return new SubtaskResource($subtask);
    }

    // PUT/PATCH /api/subtasks/{subtask}
    public function update(UpdateSubtaskRequest $request, Subtask $subtask)
    {
        $subtask->loadMissing('task');
        $this->ensureSubtaskOwner($subtask); // ✅

        $data = $request->validated();

        if (array_key_exists('is_completed', $data)) {
            if ($data['is_completed'] && !$subtask->is_completed) {
                $data['completed_at'] = now();
            } elseif (!$data['is_completed']) {
                $data['completed_at'] = null;
            }
        }

        $subtask->fill($data)->save();

        return new SubtaskResource($subtask);
    }

    public function destroy(Subtask $subtask)
    {
        $subtask->loadMissing('task');
        $this->ensureSubtaskOwner($subtask); // ✅

        $subtask->delete();
        return response()->noContent();
    }

    public function toggleComplete(Subtask $subtask)
    {
        $subtask->loadMissing('task');
        $this->ensureSubtaskOwner($subtask); // ✅

        $subtask->is_completed = !$subtask->is_completed;
        $subtask->completed_at = $subtask->is_completed ? now() : null;
        $subtask->save();

        return new SubtaskResource($subtask);
    }
}
