<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // .env থেকে নিলে সহজে বদলানো যায়
        $email = env('ADMIN_EMAIL', 'admin@example.com');
        $password = env('ADMIN_PASSWORD', 'admin123');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name'      => 'Super Admin',
                'password'  => Hash::make($password),
                'is_admin'  => true,
            ]
        );
    }
}
