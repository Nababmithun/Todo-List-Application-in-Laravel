<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    /**
     * GET /api/projects
     * - Owner OR Member যেসব প্রজেক্টে ইউজার যুক্ত, সব দেখাবে
     * - ?q= দিয়ে সার্চ (name like)
     */
    public function index(Request $request)
    {
        $userId = auth()->id();
        $q = (string) $request->query('q', '');

        $projects = Project::query()
            ->withCount('tasks')
            ->with([
                'user:id,name,email',
                'members:id,name,email',
            ])
            ->where(function ($qr) use ($userId) {
                $qr->where('user_id', $userId)
                   ->orWhereHas('members', fn($m) => $m->where('users.id', $userId));
            })
            ->when($q !== '', fn($qr) => $qr->where('name','like',"%{$q}%"))
            ->orderByDesc('id')
            ->get();

        return response()->json($projects);
    }

    /**
     * POST /api/projects
     * Body: { name, description? }
     * Owner হবে current user.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required','string','max:120'],
            'description' => ['nullable','string'],
        ]);

        $data['user_id'] = auth()->id();

        $project = Project::create($data);

        // owner কে members পিভটে অ্যাড না করলেও চলে; চাইলে রাখতে পারো
        // $project->members()->syncWithoutDetaching([$data['user_id']]);

        return response()->json($project->load('user:id,name,email'), Response::HTTP_CREATED);
    }

    /**
     * GET /api/projects/{project}
     * project.view gate: owner/member/admin allowed
     */
    public function show(Project $project)
    {
        $this->authorize('project.view', $project);

        $project->load([
            'user:id,name,email',
            'members:id,name,email',
            'tasks:id,project_id,title,is_completed,priority,due_date',
        ])->loadCount('tasks');

        return response()->json($project);
    }

    /**
     * PUT/PATCH /api/projects/{project}
     * project.manage gate: owner/admin only
     */
    public function update(Request $request, Project $project)
    {
        $this->authorize('project.manage', $project);

        $data = $request->validate([
            'name'        => ['sometimes','string','max:120'],
            'description' => ['nullable','string'],
        ]);

        $project->update($data);

        return response()->json($project->fresh(['user:id,name,email','members:id,name,email'])->loadCount('tasks'));
    }

    /**
     * DELETE /api/projects/{project}
     * project.manage gate: owner/admin only
     */
    public function destroy(Project $project)
    {
        $this->authorize('project.manage', $project);
        $project->delete();

        return response()->noContent();
    }

    // -----------------------------
    // Members Management (Pivot)
    // -----------------------------

    /**
     * GET /api/projects/{project}/members
     * project.view gate
     */
    public function members(Project $project)
    {
        $this->authorize('project.view', $project);

        $members = $project->members()->select('users.id','name','email')->get();

        return response()->json([
            'owner'   => $project->user()->select('id','name','email')->first(),
            'members' => $members,
        ]);
    }

    /**
     * POST /api/projects/{project}/members
     * Body: { user_id }
     * project.manage gate
     */
    public function addMember(Request $request, Project $project)
    {
        $this->authorize('project.manage', $project);

        $data = $request->validate([
            'user_id' => ['required','integer', Rule::exists('users','id')],
        ]);

        // Owner কে ডুপ্লিকেট করে অ্যাড করতে দিও না
        if ((int)$data['user_id'] === (int)$project->user_id) {
            return response()->json(['message' => 'Owner is already part of the project.'], 422);
        }

        $project->members()->syncWithoutDetaching([$data['user_id']]);

        return response()->json([
            'message' => 'Member added.',
            'members' => $project->members()->select('users.id','name','email')->get(),
        ], Response::HTTP_CREATED);
    }

    /**
     * DELETE /api/projects/{project}/members/{user}
     * project.manage gate
     */
    public function removeMember(Project $project, User $user)
    {
        $this->authorize('project.manage', $project);

        // Owner কে রিমুভ করা যাবে না
        if ((int)$user->id === (int)$project->user_id) {
            return response()->json(['message' => 'Cannot remove the project owner.'], 422);
        }

        $project->members()->detach($user->id);

        return response()->json([
            'message' => 'Member removed.',
            'members' => $project->members()->select('users.id','name','email')->get(),
        ]);
    }
}
