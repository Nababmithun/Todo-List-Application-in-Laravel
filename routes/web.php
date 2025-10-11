<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Tasks/Index'));   // Home = Tasks

// Auth pages (তোমার আগের মতো থাকলে ঠিকই আছে)
Route::get('/login', fn () => Inertia::render('Auth/Login'));
Route::get('/register', fn () => Inertia::render('Auth/Register'));

// Existing pages
Route::get('/tasks', fn () => Inertia::render('Tasks/Index'));
Route::get('/tasks/{id}', fn (int $id) => Inertia::render('Tasks/Show', ['id' => $id]));
Route::get('/due-soon', fn () => Inertia::render('DueSoon/Index'));
Route::get('/admin/settings', fn () => Inertia::render('Admin/Settings'));

// ✅ New: Projects section
Route::get('/projects', fn () => Inertia::render('Projects/Index'));
Route::get('/projects/{id}', fn (int $id) => Inertia::render('Projects/Show', ['id' => $id]));

// ✅ New: Complete Task section (Dashboard cards moved here)
Route::get('/complete', fn () => Inertia::render('Complete/Index'));

// Catch-all (optional)
Route::get('/{any}', fn () => Inertia::render('Tasks/Index'))
    ->where('any', '^(?!api|storage|vendor|_debugbar|nova|telescope).*$');
