<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('treatment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->constrained('users');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('status')->default('active'); // draft, active, completed, cancelled
            $table->date('start_date')->nullable();
            $table->date('target_completion_date')->nullable();
            $table->timestamps();
            $table->index(['patient_id', 'status']);
        });

        Schema::create('treatment_plan_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('treatment_plan_id')->constrained()->cascadeOnDelete();
            $table->string('tooth_number', 10)->nullable();
            $table->string('procedure_name', 200);
            $table->decimal('estimated_fee', 10, 2)->default(0);
            $table->string('status')->default('pending'); // pending, in_progress, completed, skipped
            $table->unsignedSmallInteger('sequence')->default(1);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('treatment_plan_items');
        Schema::dropIfExists('treatment_plans');
    }
};
