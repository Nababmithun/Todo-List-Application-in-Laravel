<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks','category')) {
                $table->string('category', 50)->nullable()->after('title'); // Work/Personal/...
            }
            if (!Schema::hasColumn('tasks','completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('is_completed');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks','category')) $table->dropColumn('category');
            if (Schema::hasColumn('tasks','completed_at')) $table->dropColumn('completed_at');
        });
    }
};
