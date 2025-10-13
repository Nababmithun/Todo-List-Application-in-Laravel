<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            // চাইলে এখানে আরও সিডার যোগ করতে পারো, যেমন:
            // TestUsersSeeder::class,
        ]);
    }
}
