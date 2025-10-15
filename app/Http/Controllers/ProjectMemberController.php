<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProjectMemberController extends Controller
{
    /**
     * Owner না হলেও সদস্য হলে লিস্ট দেখতে পারবে
     */
    public function index(Project $project)
    {
        $userId = auth()->id();
        abort_unless($project->isMember($userId), 403, 'Forbidden');

        $members = $project->members()
            ->select('users.id','users.name','users.email')
            ->withPivot('role')
            ->orderBy('users.name')
            ->get()
            ->map(function ($u) {
                return [
                    'id'    => $u->id,
                    'name'  => $u->name,
                    'email' => $u->email,
                    'role'  => $u->pivot?->role ?? 'member',
                ];
            });

        return response()->json($members);
    }

    /**
     * ✅ Owner-only: সদস্য যোগ করা (email অথবা user_id দিয়ে)
     * Body:
     *  - email: string (optional)  | OR |
     *  - user_id: int (optional)
     *  - role: 'member'|'owner' (optional, default 'member')
     */
    public function store(Request $request, Project $project)
    {
        // কেবল owner সদস্য যোগ/বাদ দিতে পারবে
        abort_unless((int)$project->user_id === (int)auth()->id(), 403, 'Only owner can add members');

        $data = $request->validate([
            'email'   => ['nullable','email'],
            'user_id' => ['nullable','integer','exists:users,id'],
            'role'    => ['nullable','in:member,owner'],
        ]);

        // কমপক্ষে email বা user_id যেকোনো একটা লাগবে
        if (empty($data['email']) && empty($data['user_id'])) {
            return response()->json(['message' => 'Provide either email or user_id'], 422);
        }

        // টার্গেট ইউজার রিজল্ভ
        $target = null;
        if (!empty($data['user_id'])) {
            $target = User::find($data['user_id']);
        } else {
            $target = User::where('email', $data['email'])->first();
        }
        if (!$target) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // owner নিজে তো member — কিন্তু repeat attach harmless (syncWithoutDetaching)
        $role = $data['role'] ?? 'member';
        $project->members()->syncWithoutDetaching([
            $target->id => ['role' => $role],
        ]);

        // রেসপন্সে আপডেটেড লিস্ট ফেরত দিচ্ছি
        $members = $project->members()
            ->select('users.id','users.name','users.email')
            ->withPivot('role')
            ->orderBy('users.name')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->pivot?->role ?? 'member',
            ]);

        return response()->json([
            'message' => 'Member added',
            'members' => $members,
        ], Response::HTTP_CREATED);
    }

    /**
     * ✅ Owner-only: সদস্য বাদ দেওয়া
     */
    public function destroy(Project $project, User $user)
    {
        abort_unless((int)$project->user_id === (int)auth()->id(), 403, 'Only owner can remove members');

        // Owner-কে detach করতে চাইলে—আসলে allowed কিনা তোমার নীতিতে নির্ধারণ করো।
        // এখানে owner-কে বাদ দিতে দিচ্ছি না:
        if ((int)$user->id === (int)$project->user_id) {
            return response()->json(['message' => 'Cannot remove owner'], 422);
        }

        $project->members()->detach($user->id);

        return response()->json(['message' => 'Member removed']);
    }
}
