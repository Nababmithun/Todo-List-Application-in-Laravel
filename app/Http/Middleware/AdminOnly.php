<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOnly
{
    public function handle(Request $request, Closure $next)
    {
        $u = $request->user();
        if (!$u || !$u->is_admin) {
            abort(403, 'Forbidden: Admins only.');
        }
        return $next($request);
    }
}
