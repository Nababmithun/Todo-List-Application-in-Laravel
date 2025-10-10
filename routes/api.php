<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SubtaskController;

Route::get('/', fn() => response()->json(['message' => 'Todo API OK']));

// ----- Public Auth Routes -----
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

// ----- Protected Routes (auth:sanctum) -----
Route::middleware('auth:sanctum')->group(function () {

    // current user info + logout
    Route::get('me',     [AuthController::class, 'me']);
    Route::post('logout',[AuthController::class, 'logout']);

    // Tasks (scoped to auth user)
    Route::apiResource('tasks', TaskController::class);
    Route::patch('tasks/{task}/toggle-complete', [TaskController::class, 'toggleComplete']);

    // Subtasks (must belong to auth user's tasks)
    Route::apiResource('tasks.subtasks', SubtaskController::class)->shallow();
    Route::patch('subtasks/{subtask}/toggle-complete', [SubtaskController::class, 'toggleComplete']);
});
