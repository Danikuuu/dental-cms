<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('treatment_timeline_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type', 50);
            // appointment, chart_entry, treatment_plan, invoice, payment, image_upload, note
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('tooth_number', 10)->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type', 100)->nullable();
            $table->date('event_date');
            $table->timestamps();
            $table->index(['patient_id', 'event_date']);
        });
    }
    public function down(): void { Schema::dropIfExists('treatment_timeline_events'); }
};
