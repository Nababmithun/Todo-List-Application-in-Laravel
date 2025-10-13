<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Tasks/Index'));

Route::get('/login', fn () => Inertia::render('Auth/Login'));
Route::get('/register', fn () => Inertia::render('Auth/Register'));

Route::get('/tasks', fn () => Inertia::render('Tasks/Index'));
Route::get('/tasks/{id}', fn (int $id) => Inertia::render('Tasks/Show', ['id' => $id]));

Route::get('/projects', fn () => Inertia::render('Projects/Index'));
Route::get('/projects/{id}', fn (int $id) => Inertia::render('Projects/Show', ['id' => $id]));

Route::get('/complete', fn () => Inertia::render('Complete/Index'));
Route::get('/due-soon', fn () => Inertia::render('DueSoon/Index'));
Route::get('/profile', fn () => Inertia::render('Profile/Index'))->name('profile');

/* Admin FE pages */
Route::get('/admin', fn () => Inertia::render('Admin/Dashboard'));
Route::get('/admin/users', fn () => Inertia::render('Admin/Users'));
Route::get('/admin/projects', fn () => Inertia::render('Admin/Projects'));
Route::get('/admin/tasks', fn () => Inertia::render('Admin/Tasks'));
Route::get('/admin/explorer', fn () => Inertia::render('Admin/Explorer')); // ✅ new
Route::get('/admin/settings', fn () => Inertia::render('Admin/Settings'));

Route::get('/{any}', fn () => Inertia::render('Tasks/Index'))
    ->where('any', '^(?!api|storage|vendor|_debugbar|nova|telescope).*$');
