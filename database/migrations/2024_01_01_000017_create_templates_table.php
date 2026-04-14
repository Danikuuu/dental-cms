<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 100);
            $table->string('type', 50);
            // prescription, dental_certificate, consent_form, referral_letter,
            // medical_certificate, treatment_plan, custom
            $table->longText('content');
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->index(['type', 'is_active']);
        });
    }
    public function down(): void { Schema::dropIfExists('templates'); }
};
