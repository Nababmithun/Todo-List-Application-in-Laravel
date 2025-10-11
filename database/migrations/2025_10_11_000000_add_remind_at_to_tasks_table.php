<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // due_date থাকলে ঠিক আছে; না থাকলে uncomment করো:
            // if (!Schema::hasColumn('tasks','due_date')) {
            //     $table->timestamp('due_date')->nullable()->after('priority');
            // }

            if (!Schema::hasColumn('tasks','remind_at')) {
                $table->timestamp('remind_at')->nullable()->after('due_date');
            }

            if (!Schema::hasColumn('tasks','category')) {
                $table->string('category', 50)->nullable()->after('title');
            }

            if (!Schema::hasColumn('tasks','completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('is_completed');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks','remind_at'))   $table->dropColumn('remind_at');
            if (Schema::hasColumn('tasks','category'))    $table->dropColumn('category');
            if (Schema::hasColumn('tasks','completed_at'))$table->dropColumn('completed_at');
        });
    }
};
