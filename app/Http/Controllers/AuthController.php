<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // POST /api/register (multipart)
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'mobile'   => ['nullable','string','max:20','unique:users,mobile'],
            'gender'   => ['nullable','in:male,female,other'],
            'avatar'   => ['nullable','image','max:2048'], // 2MB
        ]);

        if ($request->hasFile('avatar')) {
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        $data['password'] = Hash::make($data['password']);

        /** @var User $user */
        $user = User::create($data);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Registered',
            'token'   => $token,
            'user'    => $user->fresh(),
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $creds = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $creds['email'])->first();

        if (!$user || !Hash::check($creds['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Logged in',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        if ($user = $request->user()) {
            $user->currentAccessToken()?->delete();
        }
        return response()->json(['message' => 'Logged out']);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
