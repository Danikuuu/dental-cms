<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\ClinicSetting;
use App\Models\DentalChartEntry;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\InsuranceClaim;
use App\Models\InsuranceProvider;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\PatientInsurance;
use App\Models\Payment;
use App\Models\Service;
use App\Models\SmsReminder;
use App\Models\Template;
use App\Models\TreatmentPlan;
use App\Models\TreatmentPlanItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::disableQueryLog();
        $now = now()->toDateTimeString();

        // ── Users ─────────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(['email' => 'admin@clinic.ph'], [
            'name' => 'Administrator', 'password' => Hash::make('password'),
            'role' => 'admin', 'phone' => '09171234567',
        ]);
        $dentist1 = User::firstOrCreate(['email' => 'drsantos@clinic.ph'], [
            'name' => 'Maria Santos', 'password' => Hash::make('password'),
            'role' => 'dentist', 'phone' => '09181234567', 'license_number' => 'PRC-12345',
        ]);
        $dentist2 = User::firstOrCreate(['email' => 'drreyes@clinic.ph'], [
            'name' => 'Jose Reyes', 'password' => Hash::make('password'),
            'role' => 'dentist', 'phone' => '09191234567', 'license_number' => 'PRC-67890',
        ]);
        $staff = User::firstOrCreate(['email' => 'staff@clinic.ph'], [
            'name' => 'Ana Cruz', 'password' => Hash::make('password'),
            'role' => 'receptionist', 'phone' => '09201234567',
        ]);
        $this->command->info('✓ Users');

        // ── Clinic Settings ───────────────────────────────────────────────────
        collect([
            ['clinic_name',     'DentalCare Clinic',                          'general'],
            ['clinic_address',  '123 Mabini St., Quezon City',                'general'],
            ['clinic_phone',    '(02) 8123-4567',                             'general'],
            ['clinic_email',    'info@dentalcare.ph',                         'general'],
            ['clinic_tin',      '123-456-789-000',                            'general'],
            ['vat_registered',  'false',                                      'billing'],
            ['vat_percent',     '12',                                         'billing'],
            ['receipt_footer',  'Thank you for choosing DentalCare Clinic!',  'general'],
            ['sms_enabled',     'false',                                      'sms'],
            ['sms_provider',    'semaphore',                                  'sms'],
            ['sms_sender_name', 'DENTAL',                                     'sms'],
        ])->each(fn($s) => ClinicSetting::firstOrCreate(
            ['key' => $s[0]],
            ['value' => $s[1], 'group' => $s[2]]
        ));
        $this->command->info('✓ Clinic settings');

        // ── Services ──────────────────────────────────────────────────────────
        $services = collect([
            ['Consultation',                'General',       300.00],
            ['Oral Prophylaxis',            'Preventive',    800.00],
            ['Fluoride Treatment',          'Preventive',    500.00],
            ['Tooth-Colored Filling',       'Restorative',  1500.00],
            ['Amalgam Filling',             'Restorative',   800.00],
            ['Root Canal Treatment',        'Endodontic',   5000.00],
            ['Porcelain Crown',             'Prosthetic',   8000.00],
            ['Tooth Extraction (simple)',   'Surgical',     1000.00],
            ['Tooth Extraction (surgical)', 'Surgical',     2500.00],
            ['Teeth Whitening',             'Cosmetic',     5000.00],
            ['Dental X-Ray (periapical)',   'Diagnostic',    300.00],
            ['Panoramic X-Ray',             'Diagnostic',    800.00],
        ])->map(fn($s) => Service::firstOrCreate(
            ['name' => $s[0]],
            ['category' => $s[1], 'base_fee' => $s[2], 'is_active' => true]
        ));
        $this->command->info('✓ Services');

        // ── Inventory ─────────────────────────────────────────────────────────
        $cats = collect(['Consumables', 'Instruments', 'Medications', 'PPE', 'Restorative Materials', 'Sterilization Supplies'])
            ->mapWithKeys(fn($name) => [$name => InventoryCategory::firstOrCreate(['name' => $name])]);

        collect([
            ['Disposable Gloves (box)',   'Consumables',            'box', 50, 10, 20,  180.00, 'MED-GLOVES'],
            ['Surgical Masks (box)',       'Consumables',            'box', 30,  5, 10,   95.00, 'MED-MASK'],
            ['Cotton Rolls (bag)',         'Consumables',            'bag', 40,  8, 15,   75.00, 'MED-COTTON'],
            ['Composite Resin (syringe)', 'Restorative Materials',  'pcs', 15,  3,  5,  850.00, 'REST-COMP'],
            ['Lidocaine Cartridge (box)', 'Medications',            'box', 12,  2,  4,  480.00, 'MED-LID'],
            ['Autoclave Pouches (box)',   'Sterilization Supplies', 'box', 18,  3,  6,  250.00, 'STER-POUCH'],
            ['Face Shields',              'PPE',                    'pcs',  8,  5, 10,  150.00, 'PPE-FS'],
            ['Dental Explorer (set)',     'Instruments',            'set', 10,  2,  3,  950.00, 'INST-EXP'],
        ])->each(function ($i) use ($cats, $admin) {
            [$name, $catName, $unit, $stock, $min, $reorder, $cost, $sku] = $i;

            $item = InventoryItem::firstOrCreate(['sku' => $sku], [
                'category_id'   => $cats[$catName]->id,
                'name'          => $name,
                'unit'          => $unit,
                'current_stock' => $stock,
                'minimum_stock' => $min,
                'reorder_level' => $reorder,
                'unit_cost'     => $cost,
                'unit_price'    => $cost * 1.2,
                'supplier'      => 'MedSupply PH',
                'is_active'     => true,
            ]);

            if ($item->wasRecentlyCreated) {
                InventoryTransaction::create([
                    'item_id'          => $item->id,
                    'performed_by'     => $admin->id,
                    'type'             => 'stock_in',
                    'quantity'         => $stock,
                    'unit_cost'        => $cost,
                    'stock_before'     => 0,
                    'stock_after'      => $stock,
                    'reference'        => 'INITIAL',
                    'notes'            => 'Initial stock',
                    'transaction_date' => now()->subMonths(2)->toDateString(),
                ]);
            }
        });
        $this->command->info('✓ Inventory');

        // ── Employees ─────────────────────────────────────────────────────────
        $attendanceBulk = collect([
            ['Maria',  'Santos',   'Lead Dentist',       'full_time', 45000, 'active'],
            ['Jose',   'Reyes',    'Associate Dentist',  'full_time', 38000, 'active'],
            ['Ana',    'Cruz',     'Receptionist',       'full_time', 18000, 'active'],
            ['Lito',   'Bautista', 'Dental Assistant',   'full_time', 16000, 'active'],
            ['Carlos', 'Mendoza',  'Sterilization Tech', 'full_time', 15000, 'on_leave'],
        ])->flatMap(function ($e) use ($now) {
            [$first, $last, $position, $type, $salary, $status] = $e;

            $emp = Employee::firstOrCreate(['email' => strtolower($first) . '@clinic.ph'], [
                'first_name'      => $first,
                'last_name'       => $last,
                'position'        => $position,
                'employment_type' => $type,
                'date_hired'      => now()->subYear()->toDateString(),
                'status'          => $status,
                'phone'           => '09' . rand(100000000, 999999999),
                'basic_salary'    => $salary,
                'pay_period'      => 'monthly',
            ]);

            if (!$emp->wasRecentlyCreated) {
                return [];
            }

            // Generate weekday attendance rows for the last 2 weeks
            return collect(now()->subWeeks(2)->startOfDay()->daysUntil(now()))
                ->filter(fn($date) => $date->isWeekday())
                ->map(fn($date) => [
                    'employee_id'     => $emp->id,
                    'attendance_date' => $date->toDateString(),
                    'time_in'         => '08:00',
                    'time_out'        => '17:00',
                    'status'          => 'present',
                    'hours_worked'    => 8,
                    'notes'           => null,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ])
                ->values()
                ->all();
        });

        $attendanceBulk->chunk(100)->each(
            fn($chunk) => DB::table('employee_attendances')->insertOrIgnore($chunk->all())
        );
        $this->command->info('✓ Employees & attendance');

        // ── Patients ──────────────────────────────────────────────────────────
        $cities = ['Quezon City', 'Makati', 'Pasig', 'Caloocan', 'Manila'];

        $patients = collect([
            ['Juan',      'Carlos', 'Dela Cruz',  '1985-03-15', 'Male',   'Married',  '09171112222', false, false],
            ['Maria',     'Luz',    'Reyes',       '1990-07-22', 'Female', 'Single',   '09182223333', false, false],
            ['Roberto',   null,     'Santos',      '1975-11-08', 'Male',   'Married',  '09193334444', true,  false],
            ['Liza',      'Marie',  'Garcia',      '1995-04-30', 'Female', 'Single',   '09204445555', false, false],
            ['Fernando',  null,     'Bautista',    '1968-09-12', 'Male',   'Married',  '09215556666', true,  true],
            ['Carmen',    'Sofia',  'Mendoza',     '2000-01-18', 'Female', 'Single',   '09226667777', false, false],
            ['Antonio',   null,     'Villanueva',  '1955-06-25', 'Male',   'Widowed',  '09237778888', true,  true],
            ['Rosario',   'Paz',    'Castillo',    '1982-12-03', 'Female', 'Married',  '09248889999', false, false],
            ['Miguel',    null,     'Torres',      '1992-08-17', 'Male',   'Single',   '09259990000', false, false],
            ['Josephine', 'Claire', 'Aquino',      '1978-05-09', 'Female', 'Married',  '09261110000', false, true],
        ])->map(fn($p) => Patient::firstOrCreate(['phone' => $p[6]], [
            'first_name'       => $p[0],
            'middle_name'      => $p[1],
            'last_name'        => $p[2],
            'date_of_birth'    => $p[3],
            'sex'              => $p[4],
            'civil_status'     => $p[5],
            'phone'            => $p[6],
            'address'          => rand(1, 999) . ' Rizal St.',
            'city'             => $cities[array_rand($cities)],
            'province'         => 'Metro Manila',
            'has_hypertension' => $p[7],
            'has_diabetes'     => $p[8],
            'blood_type'       => ['A+', 'B+', 'O+', 'AB+'][array_rand(['A+', 'B+', 'O+', 'AB+'])],
            'allergies'        => rand(0, 4) === 0 ? 'Penicillin' : null,
        ]));
        $this->command->info('✓ Patients');

        // ── Insurance ─────────────────────────────────────────────────────────
        $philhealth = InsuranceProvider::firstOrCreate(['name' => 'PhilHealth'], [
            'code' => 'PH', 'contact_number' => '(02) 8441-7442', 'is_active' => true,
        ]);
        $maxicare = InsuranceProvider::firstOrCreate(['name' => 'Maxicare HMO'], [
            'code' => 'MAX', 'contact_number' => '(02) 8581-0555', 'is_active' => true,
        ]);

        $policies = $patients->take(3)->values()
            ->mapWithKeys(function ($patient, $i) use ($maxicare, $philhealth, $now) {
                $providerId = $i === 0 ? $maxicare->id : $philhealth->id;
                $existing   = DB::table('patient_insurance')
                    ->where('patient_id', $patient->id)
                    ->where('provider_id', $providerId)
                    ->first();

                if (!$existing) {
                    $id       = DB::table('patient_insurance')->insertGetId([
                        'patient_id'     => $patient->id,
                        'provider_id'    => $providerId,
                        'policy_number'  => 'POL-' . strtoupper($patient->last_name) . '-' . rand(1000, 9999),
                        'member_id'      => 'MEM-' . rand(100000, 999999),
                        'effective_date' => now()->subYear()->toDateString(),
                        'expiry_date'    => now()->addYear()->toDateString(),
                        'coverage_limit' => 50000.00,
                        'used_amount'    => 0,
                        'status'         => 'active',
                        'created_at'     => $now,
                        'updated_at'     => $now,
                    ]);
                    $existing = DB::table('patient_insurance')->find($id);
                }

                return [$patient->id => $existing];
            });
        $this->command->info('✓ Insurance');

        // ── Appointments, Invoices, Payments ──────────────────────────────────
        $dentists   = [$dentist1, $dentist2];
        $complaints = ['Tooth pain', 'Routine check-up', 'Sensitive teeth', 'Bleeding gums', 'Chipped tooth', 'Wants cleaning'];
        $conditions = ['caries', 'filling', 'healthy', 'crown', 'extracted'];
        $treatments = ['Composite filling', 'Extraction', 'Crown placement', 'Cleaning', null];
        $teeth      = [11, 12, 14, 16, 21, 22, 24, 26, 36, 37, 46, 47];
        $methods    = ['cash', 'gcash', 'maya', 'credit_card', 'bank_transfer'];

        $invoiceNumber = 1;
        $chartBulk     = [];

        $patients->each(function ($patient, $pi) use (
            $dentists, $complaints, $conditions, $treatments, $teeth, $methods,
            $admin, $services, $policies, $now, &$invoiceNumber, &$chartBulk
        ) {
            $dentist = $dentists[$pi % 2];

            // 3 past appointments per patient
            collect([0, 1, 2])->each(function ($a) use (
                $patient, $dentist, $complaints, $conditions, $treatments,
                $teeth, $methods, $admin, $services, $policies, $now, $pi,
                &$invoiceNumber, &$chartBulk
            ) {
                $daysAgo     = ($a + 1) * rand(10, 30);
                $scheduledAt = now()->subDays($daysAgo)->setHour(9 + ($a * 2))->setMinute(0)->setSecond(0);
                $status      = $a === 2 ? 'cancelled' : 'completed';

                $appt = Appointment::create([
                    'patient_id'       => $patient->id,
                    'dentist_id'       => $dentist->id,
                    'scheduled_at'     => $scheduledAt,
                    'duration_minutes' => 60,
                    'status'           => $status,
                    'chief_complaint'  => $complaints[array_rand($complaints)],
                    'clinical_notes'   => $status === 'completed' ? 'Completed without complications.' : null,
                ]);

                if ($status !== 'completed') {
                    return;
                }

                $chartBulk[] = [
                    'patient_id'     => $patient->id,
                    'appointment_id' => $appt->id,
                    'dentist_id'     => $dentist->id,
                    'tooth_number'   => $teeth[array_rand($teeth)],
                    'condition'      => $conditions[array_rand($conditions)],
                    'treatment'      => $treatments[array_rand($treatments)],
                    'status'         => 'completed',
                    'chart_type'     => 'adult',
                    'date_recorded'  => $scheduledAt->toDateString(),
                    'notes'          => null,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ];

                $svc      = $services[array_rand($services->all())];
                $total    = $svc->base_fee;
                $discount = $pi % 5 === 0 ? round($total * 0.2, 2) : 0;
                $final    = $total - $discount;
                $isPaid   = rand(0, 3) > 0;
                $seq      = str_pad($invoiceNumber++, 4, '0', STR_PAD_LEFT);
                $year     = $scheduledAt->year;
                $invDate  = $scheduledAt->toDateString();

                $invoice = Invoice::create([
                    'invoice_number'  => "INV-{$year}-{$seq}",
                    'patient_id'      => $patient->id,
                    'appointment_id'  => $appt->id,
                    'created_by'      => $admin->id,
                    'invoice_date'    => $invDate,
                    'due_date'        => $scheduledAt->copy()->addDays(30)->toDateString(),
                    'subtotal'        => $total,
                    'discount_amount' => $discount,
                    'discount_type'   => $discount > 0 ? 'senior' : null,
                    'tax_amount'      => 0,
                    'total_amount'    => $final,
                    'amount_paid'     => $isPaid ? $final : 0,
                    'balance'         => $isPaid ? 0 : $final,
                    'status'          => $isPaid ? 'paid' : 'partial',
                    'or_number'       => $isPaid ? "OR-{$year}-{$seq}" : null,
                ]);

                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'service_id'  => $svc->id,
                    'description' => $svc->name,
                    'quantity'    => 1,
                    'unit_price'  => $svc->base_fee,
                    'line_total'  => $svc->base_fee,
                ]);

                if (!$isPaid) {
                    return;
                }

                Payment::create([
                    'invoice_id'       => $invoice->id,
                    'received_by'      => $admin->id,
                    'amount'           => $final,
                    'payment_date'     => $scheduledAt->copy()->addDays(rand(0, 2))->toDateString(),
                    'method'           => $methods[array_rand($methods)],
                    'reference_number' => rand(0, 1) ? 'REF-' . rand(100000, 999999) : null,
                ]);

                if (isset($policies[$patient->id]) && $a === 0) {
                    InsuranceClaim::create([
                        'patient_insurance_id' => $policies[$patient->id]->id,
                        'invoice_id'           => $invoice->id,
                        'patient_id'           => $patient->id,
                        'claim_number'         => 'CLM-' . rand(10000, 99999),
                        'claim_date'           => $invDate,
                        'claimed_amount'       => min($final * 0.8, 10000),
                        'approved_amount'      => min($final * 0.7, 9000),
                        'status'               => ['approved', 'paid', 'submitted'][array_rand(['approved', 'paid', 'submitted'])],
                        'submission_date'      => Carbon::parse($invDate)->addDays(3)->toDateString(),
                    ]);
                }
            });

            // Today's appointment for first 5 patients
            if ($pi < 5) {
                Appointment::create([
                    'patient_id'       => $patient->id,
                    'dentist_id'       => $dentist->id,
                    'scheduled_at'     => now()->setHour(9 + $pi)->setMinute(0)->setSecond(0),
                    'duration_minutes' => 60,
                    'status'           => ['scheduled', 'confirmed'][array_rand(['scheduled', 'confirmed'])],
                    'chief_complaint'  => $complaints[array_rand($complaints)],
                ]);
            }
        });

        if (!empty($chartBulk)) {
            DB::table('dental_chart_entries')->insert($chartBulk);
        }
        $this->command->info('✓ Appointments, invoices, payments, dental charts');

        // ── Treatment Plans ───────────────────────────────────────────────────
        $planTitles = ['Full Mouth Rehabilitation', 'Caries Management', 'Periodontal Treatment', 'Orthodontic Plan'];

        $patients->take(4)->each(function ($patient, $pi) use ($dentists, $planTitles, $now) {
            $plan = TreatmentPlan::create([
                'patient_id'             => $patient->id,
                'dentist_id'             => $dentists[$pi % 2]->id,
                'title'                  => $planTitles[$pi],
                'description'            => 'Comprehensive treatment plan.',
                'status'                 => 'active',
                'start_date'             => now()->subMonths(2)->toDateString(),
                'target_completion_date' => now()->addMonths(4)->toDateString(),
            ]);

            DB::table('treatment_plan_items')->insert([
                ['treatment_plan_id' => $plan->id, 'procedure_name' => 'Oral Prophylaxis',      'estimated_fee' => 800,  'status' => 'completed',   'sequence' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['treatment_plan_id' => $plan->id, 'procedure_name' => 'Tooth-Colored Filling', 'estimated_fee' => 1500, 'status' => 'in_progress', 'sequence' => 2, 'created_at' => $now, 'updated_at' => $now],
                ['treatment_plan_id' => $plan->id, 'procedure_name' => 'Dental X-Ray',          'estimated_fee' => 300,  'status' => 'pending',     'sequence' => 3, 'created_at' => $now, 'updated_at' => $now],
            ]);
        });
        $this->command->info('✓ Treatment plans');

        // ── Templates ─────────────────────────────────────────────────────────
        collect([
            ['Standard Prescription', 'prescription',     '<div style="font-family:serif;padding:40px;max-width:600px;margin:auto"><div style="text-align:center;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:24px"><h2 style="margin:0">{{clinic_name}}</h2><p style="margin:4px 0;font-size:13px">{{clinic_address}} | {{clinic_phone}}</p><p style="margin:4px 0;font-size:13px">{{dentist_name}} | PRC Lic. No. {{dentist_license}}</p></div><div style="margin-bottom:20px"><strong>Patient:</strong> {{patient_name}} &nbsp;&nbsp; <strong>Age:</strong> {{patient_age}}<br><strong>Date:</strong> {{date}}</div><div style="border:1px solid #ccc;padding:16px;min-height:120px;margin-bottom:20px"><p style="font-size:18px;font-weight:bold;margin-top:0">Rx</p><p style="color:#666;font-style:italic">[Write medications here]</p></div><div style="margin-top:60px;text-align:right"><div style="display:inline-block;border-top:1px solid #333;padding-top:4px;min-width:200px;text-align:center">{{dentist_name}}<br><span style="font-size:12px">Signature over Printed Name</span></div></div></div>'],
            ['Dental Certificate',    'dental_certificate','<div style="font-family:serif;padding:48px;max-width:600px;margin:auto;text-align:center"><h2>{{clinic_name}}</h2><p>{{clinic_address}}</p><hr style="margin:24px 0"><h3 style="letter-spacing:2px">DENTAL CERTIFICATE</h3><p style="margin-top:32px;text-align:left;line-height:2">This is to certify that <strong>{{patient_name}}</strong>, {{patient_age}} years old, has been examined and found to be <strong>DENTALLY FIT</strong> as of <strong>{{date}}</strong>.</p><div style="margin-top:60px;text-align:right"><div style="display:inline-block;border-top:1px solid #333;padding-top:4px;min-width:220px;text-align:center">{{dentist_name}}<br><span style="font-size:12px">PRC Lic. No. {{dentist_license}}</span></div></div></div>'],
            ['Patient Consent Form',  'consent_form',      '<div style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto"><h3 style="text-align:center">{{clinic_name}}</h3><h4 style="text-align:center">INFORMED CONSENT FOR DENTAL TREATMENT</h4><p>I, <strong>{{patient_name}}</strong>, hereby give my consent to {{dentist_name}} and staff of {{clinic_name}} to perform the necessary dental procedures as discussed.</p><p>I acknowledge that I have disclosed all relevant medical history information.</p><div style="margin-top:40px;display:flex;justify-content:space-between"><div style="min-width:200px;border-top:1px solid #333;text-align:center;padding-top:4px">Patient Signature</div><div style="min-width:140px;border-top:1px solid #333;text-align:center;padding-top:4px">Date: {{date}}</div></div></div>'],
        ])->each(fn($t) => Template::firstOrCreate(
            ['name' => $t[0]],
            ['type' => $t[1], 'content' => $t[2], 'is_active' => true, 'is_default' => true, 'created_by' => $admin->id]
        ));
        $this->command->info('✓ Templates');

        // ── SMS Reminders ─────────────────────────────────────────────────────
        $smsStatuses = ['sent', 'sent', 'failed', 'pending'];

        $patients->take(5)->each(fn($patient) => SmsReminder::create([
            'patient_id'   => $patient->id,
            'phone_number' => $patient->phone,
            'message'      => "Hi {$patient->first_name}, reminder for your appointment at DentalCare Clinic.",
            'type'         => 'appointment_reminder',
            'status'       => $smsStatuses[array_rand($smsStatuses)],
            'scheduled_at' => now()->subDays(rand(1, 10)),
            'sent_at'      => now()->subDays(rand(1, 10)),
        ]));
        $this->command->info('✓ SMS reminders');

        // ── Activity Logs (single bulk insert) ────────────────────────────────
        DB::table('activity_logs')->insert([
            ['user_id' => $admin->id,    'action' => 'login',                 'description' => 'User logged in',                          'ip_address' => '127.0.0.1', 'created_at' => now()->subDays(5)->toDateTimeString(), 'updated_at' => $now],
            ['user_id' => $dentist1->id, 'action' => 'login',                 'description' => 'User logged in',                          'ip_address' => '127.0.0.1', 'created_at' => now()->subDays(4)->toDateTimeString(), 'updated_at' => $now],
            ['user_id' => $admin->id,    'action' => 'create_patient',        'description' => 'Created patient: Juan Carlos Dela Cruz',   'ip_address' => '127.0.0.1', 'created_at' => now()->subDays(3)->toDateTimeString(), 'updated_at' => $now],
            ['user_id' => $admin->id,    'action' => 'create_patient',        'description' => 'Created patient: Maria Luz Reyes',         'ip_address' => '127.0.0.1', 'created_at' => now()->subDays(3)->toDateTimeString(), 'updated_at' => $now],
            ['user_id' => $dentist1->id, 'action' => 'create_treatment_plan', 'description' => 'Created treatment plan for patient',       'ip_address' => '127.0.0.1', 'created_at' => now()->subDays(2)->toDateTimeString(), 'updated_at' => $now],
            ['user_id' => $admin->id,    'action' => 'issue_or',              'description' => 'Issued OR #OR-2025-0001',                  'ip_address' => '127.0.0.1', 'created_at' => now()->subDays(1)->toDateTimeString(), 'updated_at' => $now],
            ['user_id' => $admin->id,    'action' => 'create_employee',       'description' => 'Created employee: Maria Santos',           'ip_address' => '127.0.0.1', 'created_at' => now()->subDays(1)->toDateTimeString(), 'updated_at' => $now],
            ['user_id' => $staff->id,    'action' => 'login',                 'description' => 'User logged in',                          'ip_address' => '127.0.0.1', 'created_at' => now()->toDateTimeString(),             'updated_at' => $now],
        ]);
        $this->command->info('✓ Activity logs');

        $this->command->newLine();
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('  Seeding complete!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('  admin@clinic.ph     / password  (Admin)');
        $this->command->info('  drsantos@clinic.ph  / password  (Dentist)');
        $this->command->info('  drreyes@clinic.ph   / password  (Dentist)');
        $this->command->info('  staff@clinic.ph     / password  (Receptionist)');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}