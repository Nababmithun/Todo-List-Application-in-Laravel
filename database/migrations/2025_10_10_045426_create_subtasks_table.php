<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subtasks', function (Blueprint $table) {
            $table->id();

            // Foreign key to tasks.id
            $table->foreignId('task_id')
                  ->constrained('tasks')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete(); // parent task delete হলে subtasks-ও ডিলিট

            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->date('due_date')->nullable();
            $table->tinyInteger('priority')->default(3); // 1..5

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subtasks');
    }
};
