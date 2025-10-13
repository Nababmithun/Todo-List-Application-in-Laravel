<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    // Demo store in config or DB; এখানে ডেমো JSON দিচ্ছি
    public function show()
    {
        return response()->json([
            'allow_reminders' => true,
            'default_priority' => 'medium',
            'version' => '1.0.0',
        ]);
    }

    public function update(Request $request)
    {
        // validate & persist as needed
        $data = $request->validate([
            'allow_reminders' => ['boolean'],
            'default_priority'=> ['in:low,medium,high'],
        ]);
        // persist করো (config/db)। এখানে ডেমো রিটার্ন।
        return response()->json([
            'message' => 'Updated',
            'settings' => $data,
        ]);
    }
}
