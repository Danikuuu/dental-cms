import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
    store as storePatient,
    update as updatePatient,
} from '@/wayfinder/actions/App/Http/Controllers/PatientController';

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">{title}</h3>
        {children}
    </div>
);
const F = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);
const CB = ({ label, name, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
        <span className="text-sm text-slate-700">{label}</span>
    </label>
);

const defaultValues = {
    first_name: '', middle_name: '', last_name: '', date_of_birth: '', sex: '', civil_status: '',
    address: '', city: '', province: '', phone: '', email: '', occupation: '', referred_by: '', philhealth_number: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    blood_type: '', allergies: '', current_medications: '', past_surgeries: '', medical_notes: '',
    has_hypertension: false, has_diabetes: false, has_heart_disease: false, has_asthma: false,
    has_bleeding_disorder: false, has_thyroid_disorder: false, is_pregnant: false,
    has_kidney_disease: false, has_liver_disease: false,
    last_dental_visit: '', previous_dentist: '', dental_complaints: '',
};

export function PatientForm({ patient, mode }: { patient?: any; mode: 'create' | 'edit' }) {
    const initial = patient
        ? { ...defaultValues, ...patient, date_of_birth: patient.date_of_birth?.split('T')[0] ?? '', last_dental_visit: patient.last_dental_visit?.split('T')[0] ?? '' }
        : defaultValues;

    const { data, setData, submit, processing, errors } = useForm(initial);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            submit(storePatient());
        } else {
            submit(updatePatient({ patient: patient.id }));
        }
    };

    const chk = (field: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) => setData(field, e.target.checked as any);
    const txt = (field: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setData(field, e.target.value as any);

    return (
        <AppLayout title={mode === 'create' ? 'New Patient' : `Edit — ${patient?.full_name}`}>
            <form onSubmit={handleSubmit} className="max-w-4xl">
                <Section title="Personal Information">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <F label="First Name" required error={errors.first_name}><input type="text" value={data.first_name} onChange={txt('first_name')} className={inputCls} /></F>
                        <F label="Middle Name"><input type="text" value={data.middle_name} onChange={txt('middle_name')} className={inputCls} /></F>
                        <F label="Last Name" required error={errors.last_name}><input type="text" value={data.last_name} onChange={txt('last_name')} className={inputCls} /></F>
                        <F label="Date of Birth" required error={errors.date_of_birth}><input type="date" value={data.date_of_birth} onChange={txt('date_of_birth')} className={inputCls} /></F>
                        <F label="Sex" required error={errors.sex}>
                            <select value={data.sex} onChange={txt('sex')} className={inputCls}>
                                <option value="">Select…</option><option>Male</option><option>Female</option>
                            </select>
                        </F>
                        <F label="Civil Status">
                            <select value={data.civil_status} onChange={txt('civil_status')} className={inputCls}>
                                <option value="">Select…</option>
                                {['Single','Married','Widowed','Separated'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </F>
                    </div>
                </Section>

                <Section title="Contact Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <F label="Street Address"><input type="text" value={data.address} onChange={txt('address')} className={inputCls} /></F>
                        <F label="City"><input type="text" value={data.city} onChange={txt('city')} className={inputCls} /></F>
                        <F label="Province"><input type="text" value={data.province} onChange={txt('province')} className={inputCls} /></F>
                        <F label="Phone"><input type="tel" value={data.phone} onChange={txt('phone')} placeholder="09XX XXX XXXX" className={inputCls} /></F>
                        <F label="Email"><input type="email" value={data.email} onChange={txt('email')} className={inputCls} /></F>
                        <F label="Occupation"><input type="text" value={data.occupation} onChange={txt('occupation')} className={inputCls} /></F>
                        <F label="Referred By"><input type="text" value={data.referred_by} onChange={txt('referred_by')} className={inputCls} /></F>
                        <F label="PhilHealth Number"><input type="text" value={data.philhealth_number} onChange={txt('philhealth_number')} className={inputCls} /></F>
                    </div>
                </Section>

                <Section title="Emergency Contact">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <F label="Name"><input type="text" value={data.emergency_contact_name} onChange={txt('emergency_contact_name')} className={inputCls} /></F>
                        <F label="Phone"><input type="tel" value={data.emergency_contact_phone} onChange={txt('emergency_contact_phone')} className={inputCls} /></F>
                        <F label="Relationship"><input type="text" value={data.emergency_contact_relation} onChange={txt('emergency_contact_relation')} className={inputCls} /></F>
                    </div>
                </Section>

                <Section title="Medical History">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 mb-4">
                        <CB label="Hypertension"      name="has_hypertension"      checked={data.has_hypertension}      onChange={chk('has_hypertension')} />
                        <CB label="Diabetes"          name="has_diabetes"          checked={data.has_diabetes}          onChange={chk('has_diabetes')} />
                        <CB label="Heart Disease"     name="has_heart_disease"     checked={data.has_heart_disease}     onChange={chk('has_heart_disease')} />
                        <CB label="Asthma"            name="has_asthma"            checked={data.has_asthma}            onChange={chk('has_asthma')} />
                        <CB label="Bleeding Disorder" name="has_bleeding_disorder" checked={data.has_bleeding_disorder} onChange={chk('has_bleeding_disorder')} />
                        <CB label="Thyroid Disorder"  name="has_thyroid_disorder"  checked={data.has_thyroid_disorder}  onChange={chk('has_thyroid_disorder')} />
                        <CB label="Kidney Disease"    name="has_kidney_disease"    checked={data.has_kidney_disease}    onChange={chk('has_kidney_disease')} />
                        <CB label="Liver Disease"     name="has_liver_disease"     checked={data.has_liver_disease}     onChange={chk('has_liver_disease')} />
                        <CB label="Pregnant"          name="is_pregnant"           checked={data.is_pregnant}           onChange={chk('is_pregnant')} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <F label="Blood Type">
                            <select value={data.blood_type} onChange={txt('blood_type')} className={inputCls}>
                                <option value="">Unknown</option>
                                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </F>
                        <F label="Allergies (drugs, food, materials)"><input type="text" value={data.allergies} onChange={txt('allergies')} placeholder="e.g. Penicillin, Latex" className={inputCls} /></F>
                        <F label="Current Medications"><textarea rows={2} value={data.current_medications} onChange={txt('current_medications')} className={inputCls + ' resize-none'} /></F>
                        <F label="Medical Notes / Other Conditions"><textarea rows={2} value={data.medical_notes} onChange={txt('medical_notes')} className={inputCls + ' resize-none'} /></F>
                    </div>
                </Section>

                <Section title="Dental History">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <F label="Last Dental Visit"><input type="date" value={data.last_dental_visit} onChange={txt('last_dental_visit')} className={inputCls} /></F>
                        <F label="Previous Dentist"><input type="text" value={data.previous_dentist} onChange={txt('previous_dentist')} className={inputCls} /></F>
                        <F label="Chief Dental Complaint"><textarea rows={2} value={data.dental_complaints} onChange={txt('dental_complaints')} className={inputCls + ' resize-none sm:col-span-2'} /></F>
                    </div>
                </Section>

                <div className="flex items-center gap-3 justify-end">
                    <a href={mode === 'create' ? '/patients' : `/patients/${patient?.id}`}
                        className="px-5 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        Cancel
                    </a>
                    <button type="submit" disabled={processing}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                        {processing ? 'Saving…' : (mode === 'create' ? 'Save Patient' : 'Update Patient')}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
