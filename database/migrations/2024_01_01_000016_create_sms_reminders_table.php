<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sms_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('phone_number', 20);
            $table->text('message');
            $table->string('status', 20)->default('pending');
            // pending, sent, failed, cancelled
            $table->string('type', 30)->default('custom');
            // appointment_reminder, follow_up, custom
            $table->dateTime('scheduled_at');
            $table->dateTime('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->string('provider', 30)->nullable();
            $table->string('message_id', 100)->nullable();
            $table->timestamps();
            $table->index(['status', 'scheduled_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('sms_reminders'); }
};
