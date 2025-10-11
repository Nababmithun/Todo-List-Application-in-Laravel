<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\AdminSettingsController; // ← যদি আলাদা কন্ট্রোলার ইউজ করো

// /api root test
Route::get('/', fn() => response()->json(['message' => 'Todo API OK']));

// ----- Public Auth Routes -----
Route::post('register', [AuthController::class, 'register']); // multipart: name,email,password,mobile,gender,avatar
Route::post('login',    [AuthController::class, 'login']);

// ----- Protected Routes (auth:sanctum) -----
Route::middleware('auth:sanctum')->group(function () {

    // current user info + logout
    Route::get('me',      [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Tasks (scoped to auth user)
    Route::apiResource('tasks', TaskController::class);
    Route::patch('tasks/{task}/toggle-complete', [TaskController::class, 'toggleComplete']);

    // Due soon (UI: /api/tasks-due-soon?hours=24&per_page=50)
    Route::get('tasks-due-soon', [TaskController::class, 'dueSoon']);

    // Subtasks (must belong to auth user's tasks)
    Route::apiResource('tasks.subtasks', SubtaskController::class)->shallow();
    Route::patch('subtasks/{subtask}/toggle-complete', [SubtaskController::class, 'toggleComplete']);
    
    // stats endpoint
    Route::get('tasks-stats', [TaskController::class, 'stats']);

    // Admin settings (UI reads & updates these)
    // GET /api/admin/settings  → settings JSON
    // PUT /api/admin/settings  → update settings
    Route::get('admin/settings', [AdminSettingsController::class, 'show'])
        ->middleware('can:isAdmin'); // ← নিজের admin middleware/policy বসাও
    Route::put('admin/settings', [AdminSettingsController::class, 'update'])
        ->middleware('can:isAdmin');
});
