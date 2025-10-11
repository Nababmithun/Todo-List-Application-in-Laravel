<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users','mobile')) {
                $table->string('mobile', 20)->nullable()->unique()->after('email');
            }
            if (!Schema::hasColumn('users','gender')) {
                $table->enum('gender', ['male','female','other'])->nullable()->after('mobile');
            }
            if (!Schema::hasColumn('users','avatar_path')) {
                $table->string('avatar_path')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('users','is_admin')) {
                $table->boolean('is_admin')->default(false)->after('password');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users','mobile')) $table->dropUnique(['mobile']);
            $table->dropColumn(['mobile','gender','avatar_path','is_admin']);
        });
    }
};
