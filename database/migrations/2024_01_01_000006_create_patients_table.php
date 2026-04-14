<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('patient_code', 20)->unique();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->date('date_of_birth');
            $table->string('sex', 10);
            $table->string('civil_status', 20)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('referred_by', 100)->nullable();
            $table->string('philhealth_number', 20)->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('emergency_contact_relation', 50)->nullable();
            // Medical history
            $table->boolean('has_hypertension')->default(false);
            $table->boolean('has_diabetes')->default(false);
            $table->boolean('has_heart_disease')->default(false);
            $table->boolean('has_asthma')->default(false);
            $table->boolean('has_bleeding_disorder')->default(false);
            $table->boolean('has_thyroid_disorder')->default(false);
            $table->boolean('is_pregnant')->default(false);
            $table->boolean('has_kidney_disease')->default(false);
            $table->boolean('has_liver_disease')->default(false);
            $table->string('blood_type', 5)->nullable();
            $table->text('allergies')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('past_surgeries')->nullable();
            $table->text('medical_notes')->nullable();
            // Dental history
            $table->date('last_dental_visit')->nullable();
            $table->string('previous_dentist', 100)->nullable();
            $table->text('dental_complaints')->nullable();
            $table->string('photo_path')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('patients'); }
};
