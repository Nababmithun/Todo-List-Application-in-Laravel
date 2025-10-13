<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private function payloadUser(User $u): array
    {
        return [
            'id'         => $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'mobile'     => $u->mobile,
            'gender'     => $u->gender,
            'is_admin'   => (bool) $u->is_admin,
            'avatar_url' => $u->avatar_path ? url('storage/'.$u->avatar_path) : null,
            'created_at' => $u->created_at,
            'updated_at' => $u->updated_at,
        ];
    }

    // POST /api/register (multipart)
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'mobile'   => ['nullable','string','max:20','unique:users,mobile'],
            'gender'   => ['nullable', Rule::in(['male','female','other'])],
            'avatar'   => ['nullable','image','max:2048'],
        ]);

        if ($request->hasFile('avatar')) {
            $data['avatar_path'] = $request->file('avatar')->store('avatars','public');
        }

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        // চাইলে অটো-লগইন করতে পারো; আমরা টোকেন দিচ্ছি, FE চাইলে সেভ করবে
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Registered',
            'token'   => $token,
            'user'    => $this->payloadUser($user),
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $creds = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email',$creds['email'])->first();

        if (!$user || !Hash::check($creds['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Logged in',
            'token'   => $token,
            'user'    => $this->payloadUser($user),
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message'=>'Logged out']);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return response()->json($this->payloadUser($request->user()));
    }
}
