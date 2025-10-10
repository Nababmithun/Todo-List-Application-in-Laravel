<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');                      // title
            $table->text('description')->nullable();      // des
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->date('due_date')->nullable();         // শেষ করার ডেডলাইন
            $table->tinyInteger('priority')->default(3);  // 1=High ... 5=Low
            $table->timestamps();
            $table->softDeletes();                        // soft delete
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
