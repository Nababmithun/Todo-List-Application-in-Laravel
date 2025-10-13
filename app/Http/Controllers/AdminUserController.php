<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    // GET /api/admin/users?q=&per_page=
    public function index(Request $request)
    {
        $q   = $request->string('q')->toString();
        $per = (int) $request->input('per_page', 15);

        $rows = User::select('id','name','email','mobile','is_admin')
            ->when($q, function($qr) use ($q) {
                $qr->where(function($sub) use ($q){
                    $sub->where('name','like',"%{$q}%")
                        ->orWhere('email','like',"%{$q}%")
                        ->orWhere('mobile','like',"%{$q}%");
                });
            })
            ->orderBy('is_admin','desc')
            ->orderByDesc('id')
            ->paginate($per)
            ->appends($request->query());

        return response()->json($rows);
    }
}
