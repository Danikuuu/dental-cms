<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('scheduled_at');
            $table->unsignedSmallInteger('duration_minutes')->default(30);
            $table->string('status')->default('scheduled');
            // scheduled, confirmed, in_progress, completed, cancelled, no_show
            $table->string('chief_complaint', 500)->nullable();
            $table->text('notes')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->timestamps();
            $table->index(['scheduled_at', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('appointments'); }
};
