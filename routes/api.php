<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\AdminSettingsController; // optional
use App\Http\Controllers\ProjectController;       // ✅ add this

// Root ping
Route::get('/', fn() => response()->json(['message' => 'Todo API OK']));

// ---------- Public Auth ----------
Route::post('register', [AuthController::class, 'register']); // multipart: name,email,password,mobile,gender,avatar
Route::post('login',    [AuthController::class, 'login']);

// ---------- Protected ----------
Route::middleware('auth:sanctum')->group(function () {

    // me + logout
    Route::get('me',      [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // ✅ Projects
    Route::apiResource('projects', ProjectController::class)->except(['create','edit']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::patch('tasks/{task}/toggle-complete', [TaskController::class, 'toggleComplete']);

    // Due soon + Stats
    Route::get('tasks-due-soon', [TaskController::class, 'dueSoon']);
    Route::get('tasks-stats',    [TaskController::class, 'stats']);

    // Subtasks (shallow routes)
    Route::apiResource('tasks.subtasks', SubtaskController::class)->shallow();
    Route::patch('subtasks/{subtask}/toggle-complete', [SubtaskController::class, 'toggleComplete']);

    // Admin settings (optional; needs your policy/middleware)
    Route::get('admin/settings', [AdminSettingsController::class, 'show'])
        ->middleware('can:isAdmin');
    Route::put('admin/settings', [AdminSettingsController::class, 'update'])
        ->middleware('can:isAdmin');
});
