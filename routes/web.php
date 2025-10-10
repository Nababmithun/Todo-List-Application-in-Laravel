<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Auth/Login'));

Route::get('/login', fn () => Inertia::render('Auth/Login'));
Route::get('/register', fn () => Inertia::render('Auth/Register'));

Route::get('/tasks', fn () => Inertia::render('Tasks/Index'));
Route::get('/tasks/{id}', fn (int $id) => Inertia::render('Tasks/Show', ['id' => $id]));
Route::get('/due-soon', fn () => Inertia::render('DueSoon/Index'));
Route::get('/admin/settings', fn () => Inertia::render('Admin/Settings'));

Route::get('/{any}', fn () => Inertia::render('Tasks/Index'))
    ->where('any', '^(?!api|storage|vendor|_debugbar|nova|telescope).*$');
