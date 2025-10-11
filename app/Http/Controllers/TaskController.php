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

    /**
     * Helper: map priority string->int (for DB filtering)
     */
    private function mapPriority($value): ?int
    {
        if ($value === null || $value === '') return null;
        $map = ['low' => 0, 'medium' => 1, 'high' => 2, '0'=>0, '1'=>1, '2'=>2, 0=>0,1=>1,2=>2];
        return $map[$value] ?? null;
    }

    /**
     * GET /api/tasks
     * Query params:
     *  - q, is_completed=true|false, priority, category, project_id
     *  - due_date_from / due_date_to (alias: date_from/date_to) -> YYYY-MM-DD
     *  - per_page (1..100)
     */
    public function index(Request $request)
    {
        $query = Task::query()->where('user_id', auth()->id());

        // search
        if ($q = $request->input('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        // completion filter
        if (!is_null($request->input('is_completed'))) {
            $query->where(
                'is_completed',
                filter_var($request->input('is_completed'), FILTER_VALIDATE_BOOLEAN)
            );
        }

        // priority, category, project
        if (($priority = $request->input('priority')) !== null && $priority !== '') {
            $p = $this->mapPriority($priority);
            if ($p !== null) {
                $query->where('priority', $p);
            }
        }
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }
        if ($pid = $request->input('project_id')) {
            $query->where('project_id', $pid);
        }

        // date range
        $from = $request->input('due_date_from', $request->input('date_from'));
        $to   = $request->input('due_date_to',   $request->input('date_to'));
        if ($from) $query->whereDate('due_date', '>=', $from);
        if ($to)   $query->whereDate('due_date', '<=', $to);

        // pagination
        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min(100, $perPage));

        // sort: pending first, earlier due first, newest last
        $query->orderBy('is_completed') // asc
              ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC')
              ->orderBy('due_date')     // asc
              ->orderByDesc('id');

        $tasks = $query->paginate($perPage)->appends($request->query());

        return TaskResource::collection($tasks);
    }

    /**
     * POST /api/tasks
     * Body: project_id?, title, description?, priority?, due_date?, remind_at?, category?, is_completed?
     */
    public function store(StoreTaskRequest $request)
    {
        $data = $request->validated();

        $data['user_id']      = auth()->id();

        // Normalize priority for DB (if raw int column)
        if (array_key_exists('priority', $data)) {
            $data['priority'] = $this->mapPriority($data['priority']) ?? 1; // default medium
        }

        // initialize completion fields
        $data['is_completed'] = !empty($data['is_completed']);
        $data['completed_at'] = $data['is_completed'] ? Carbon::now() : null;

        $task = Task::create($data);

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * GET /api/tasks/{task}
     */
    public function show(Task $task)
    {
        $this->ensureOwner($task);
        $task->load('subtasks');
        return new TaskResource($task);
    }

    /**
     * PUT/PATCH /api/tasks/{task}
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->ensureOwner($task);
        $data = $request->validated();

        // Normalize priority if present
        if (array_key_exists('priority', $data)) {
            $mapped = $this->mapPriority($data['priority']);
            if ($mapped !== null) {
                $data['priority'] = $mapped;
            } else {
                unset($data['priority']);
            }
        }

        // completion toggle handling
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

    /**
     * DELETE /api/tasks/{task}
     */
    public function destroy(Task $task)
    {
        $this->ensureOwner($task);
        $task->delete();

        return response()->noContent();
    }

    /**
     * PATCH /api/tasks/{task}/toggle-complete
     */
    public function toggleComplete(Task $task)
    {
        $this->ensureOwner($task);

        $task->is_completed = !$task->is_completed;
        $task->completed_at = $task->is_completed ? now() : null;
        $task->save();

        return new TaskResource($task);
    }

    /**
     * GET /api/tasks-due-soon?hours=24&per_page=50
     * Incomplete tasks due within next N hours (default 24)
     */
    public function dueSoon(Request $request)
    {
        $hours   = (int) $request->input('hours', 24);
        $perPage = max(1, min(100, (int) $request->input('per_page', 50)));

        $now = Carbon::now(config('app.timezone'));
        $until = (clone $now)->addHours(max(1, $hours));

        $query = Task::where('user_id', auth()->id())
            ->where('is_completed', false)
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$now, $until])
            ->orderBy('due_date');

        return TaskResource::collection($query->paginate($perPage)->appends($request->query()));
    }

    /**
     * GET /api/tasks-stats
     * Returns: { today_completed, upcoming_count }
     */
    public function stats(Request $request)
    {
        $userId = auth()->id();
        $today = Carbon::today(config('app.timezone'));

        $todayCompleted = Task::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->whereDate('completed_at', $today)
            ->count();

        $upcoming = Task::where('user_id', $userId)
            ->where('is_completed', false)
            ->whereDate('due_date', '>=', $today)
            ->count();

        return response()->json([
            'today_completed' => $todayCompleted,
            'upcoming_count'  => $upcoming,
        ]);
    }
}
