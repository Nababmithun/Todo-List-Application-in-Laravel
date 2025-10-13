<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AdminSummaryController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminProjectController;
use App\Http\Controllers\AdminTaskController;

Route::get('/', fn()=>response()->json(['message'=>'Todo API OK']))->name('api.ping');

/* Public */
Route::post('register', [AuthController::class,'register'])->middleware('throttle:20,1')->name('api.register');
Route::post('login',    [AuthController::class,'login'])->middleware('throttle:30,1')->name('api.login');

/* Protected */
Route::middleware('auth:sanctum')->group(function () {
    Route::get('me',     [AuthController::class,'me'])->name('api.me');
    Route::post('logout',[AuthController::class,'logout'])->name('api.logout');

    // User-scoped
    Route::apiResource('projects', ProjectController::class)->except(['create','edit'])->names('api.projects');
    Route::apiResource('tasks', TaskController::class)->except(['create','edit'])->names('api.tasks');
    Route::patch('tasks/{task}/toggle-complete', [TaskController::class,'toggleComplete'])->name('api.tasks.toggle');
    Route::apiResource('tasks.subtasks', SubtaskController::class)->shallow()->except(['create','edit'])->names('api.subtasks');
    Route::patch('subtasks/{subtask}/toggle-complete',[SubtaskController::class,'toggleComplete'])->name('api.subtasks.toggle');
    Route::get('tasks-due-soon', [TaskController::class,'dueSoon'])->name('api.tasks.dueSoon');
    Route::get('tasks-stats',    [TaskController::class,'stats'])->name('api.tasks.stats');

    // Admin-only
    Route::prefix('admin')->middleware('can:isAdmin')->group(function () {
        Route::get('summary',      [AdminSummaryController::class, 'show'])->name('api.admin.summary');
        Route::get('settings',     [AdminSettingsController::class,'show'])->name('api.admin.settings.show');
        Route::put('settings',     [AdminSettingsController::class,'update'])->name('api.admin.settings.update');

        Route::get('users',        [AdminUserController::class,    'index'])->name('api.admin.users.index');

        // ✅ Projects (all) + by user + optional include=tasks
        Route::get('projects',     [AdminProjectController::class, 'index'])->name('api.admin.projects.index');
        Route::get('users/{user}/projects', [AdminProjectController::class, 'byUser'])->name('api.admin.projects.byUser');

        // ✅ Tasks (all) + by project
        Route::get('tasks',        [AdminTaskController::class,    'index'])->name('api.admin.tasks.index');
        Route::get('projects/{project}/tasks', [AdminTaskController::class, 'byProject'])->name('api.admin.tasks.byProject');

        // (optional) tree summary: users→projects→counts
        Route::get('tree', [AdminSummaryController::class, 'tree'])->name('api.admin.tree');
        
        // admin can manage any task
        Route::patch('tasks/{task}/toggle-complete', [AdminTaskController::class, 'toggleComplete'])->name('api.admin.tasks.toggle');
        Route::delete('tasks/{task}', [AdminTaskController::class, 'destroy'])->name('api.admin.tasks.destroy');
    });
});

Route::fallback(fn() => response()->json(['message'=>'Not Found'],404));
