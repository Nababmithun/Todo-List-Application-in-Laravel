<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    private function ensureOwner(Project $project): void
    {
        abort_unless($project->user_id === auth()->id(), 403, 'Forbidden');
    }

    // GET /api/projects
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();
        return Project::where('user_id', auth()->id())
            ->when($q, fn($qr) => $qr->where('name','like',"%{$q}%"))
            ->orderByDesc('id')
            ->get();
    }

    // POST /api/projects
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required','string','max:120'],
            'description' => ['nullable','string'],
        ]);
        $data['user_id'] = auth()->id();

        $project = Project::create($data);
        return response()->json($project, Response::HTTP_CREATED);
    }

    // GET /api/projects/{project}
    public function show(Project $project)
    {
        $this->ensureOwner($project);
        return response()->json($project);
    }

    // PUT/PATCH /api/projects/{project}
    public function update(Request $request, Project $project)
    {
        $this->ensureOwner($project);
        $data = $request->validate([
            'name'        => ['sometimes','string','max:120'],
            'description' => ['nullable','string'],
        ]);
        $project->update($data);
        return response()->json($project);
    }

    // DELETE /api/projects/{project}
    public function destroy(Project $project)
    {
        $this->ensureOwner($project);
        $project->delete();
        return response()->noContent();
    }
}
