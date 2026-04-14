<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('patient_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uploaded_by')->constrained('users');
            $table->string('filename');
            $table->string('original_name');
            $table->string('type', 20); // xray, intraoral, extraoral, document, other
            $table->string('tooth_number', 10)->nullable();
            $table->text('notes')->nullable();
            $table->date('date_taken');
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type', 50)->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('patient_images'); }
};
