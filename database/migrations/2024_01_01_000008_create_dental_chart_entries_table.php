<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('dental_chart_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dentist_id')->constrained('users')->cascadeOnDelete();
            $table->string('tooth_number', 10);
            $table->string('surface', 20)->nullable();
            $table->string('condition', 100);
            $table->string('treatment', 100)->nullable();
            $table->string('status', 20)->default('existing'); // existing, planned, completed
            $table->string('chart_type', 10)->default('adult'); // adult, pedo
            $table->date('date_recorded');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['patient_id', 'chart_type']);
        });
    }
    public function down(): void { Schema::dropIfExists('dental_chart_entries'); }
};
