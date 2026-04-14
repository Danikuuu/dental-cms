import {
    store as storeAppointment,
    update as updateAppointment,
} from '@/wayfinder/actions/App/Http/Controllers/AppointmentController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS: Record<string,string> = {
    scheduled:   'border-l-blue-400 bg-blue-50/40',
    confirmed:   'border-l-teal-400 bg-teal-50/40',
    in_progress: 'border-l-amber-400 bg-amber-50/40',
    completed:   'border-l-green-400 bg-green-50/40',
    cancelled:   'border-l-slate-300 bg-slate-50/40 opacity-60',
    no_show:     'border-l-red-300 bg-red-50/30',
};

export default function AppointmentsIndex({ appointments, dentists, filters }: any) {
    const today = new Date().toISOString().split('T')[0];
    const [viewDate, setViewDate] = useState(filters?.date ?? today);
    const [showForm, setShowForm] = useState(false);
    const ic = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";

    const { data, setData, submit, processing, reset } = useForm({
        patient_id: '', dentist_id: '', scheduled_at: viewDate + 'T09:00',
        duration_minutes: 30, chief_complaint: '', notes: '',
    });

    const goDate = (d: string) => {
        setViewDate(d);
        router.get('/appointments', { ...filters, date: d }, { preserveState: true });
    };
    const shift = (days: number) => {
        const d = new Date(viewDate); d.setDate(d.getDate() + days);
        goDate(d.toISOString().split('T')[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(storeAppointment(), { onSuccess: () => { reset(); setShowForm(false); } });
    };

    // FIX: use Wayfinder typed action instead of hardcoded router.put URL
    const setStatus = (id: number, status: string) =>
        router.put(updateAppointment(id).url, { status }, { preserveState: true });

    const fmtTime = (dt: string) => new Date(dt).toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit' });
    const fmtDate = (d: string) => new Date(d+'T00:00').toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    return (
        <AppLayout title="Appointments">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => shift(-1)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                    </button>
                    <input type="date" value={viewDate} onChange={e => goDate(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <button onClick={() => shift(1)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                    </button>
                    {viewDate !== today && (
                        <button onClick={() => goDate(today)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">Today</button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <select value={filters?.dentist_id ?? ''}
                        onChange={e => router.get('/appointments', { ...filters, date: viewDate, dentist_id: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">All Dentists</option>
                        {dentists?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                        <PlusIcon className="w-4 h-4" /> Schedule
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white border border-teal-200 rounded-xl p-5 mb-4">
                    <h3 className="font-semibold text-slate-700 mb-4">Schedule New Appointment</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs text-slate-500 mb-1 block">Patient ID *</label>
                                <input type="number" placeholder="Enter Patient ID" required value={data.patient_id}
                                    onChange={e => setData('patient_id', e.target.value)} className={ic} />
                                <p className="text-xs text-slate-400 mt-0.5">Find the ID on the Patients page</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Dentist *</label>
                                <select value={data.dentist_id} onChange={e => setData('dentist_id', e.target.value)} required className={ic}>
                                    <option value="">Select…</option>
                                    {dentists?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Date & Time *</label>
                                <input type="datetime-local" value={data.scheduled_at}
                                    onChange={e => setData('scheduled_at', e.target.value)} required className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Duration</label>
                                <select value={data.duration_minutes} onChange={e => setData('duration_minutes', Number(e.target.value))} className={ic}>
                                    {[15,30,45,60,90,120].map(m => <option key={m} value={m}>{m} mins</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Chief Complaint</label>
                                <input type="text" value={data.chief_complaint}
                                    onChange={e => setData('chief_complaint', e.target.value)} className={ic} placeholder="Reason for visit…" />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {processing ? 'Scheduling…' : 'Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-700 text-sm">{fmtDate(viewDate)}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{appointments.data?.length ?? 0} appointment(s)</p>
                </div>

                {appointments.data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <CalendarIcon className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm">No appointments for this day</p>
                        <button onClick={() => setShowForm(true)} className="mt-2 text-teal-600 text-sm hover:underline">Schedule one →</button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {appointments.data?.map((a: any) => (
                            <div key={a.id} className={`flex items-start gap-4 px-5 py-4 border-l-4 ${STATUS_COLORS[a.status] ?? ''}`}>
                                <div className="w-16 flex-shrink-0 pt-0.5 text-center">
                                    <div className="text-sm font-bold text-slate-700">{fmtTime(a.scheduled_at)}</div>
                                    <div className="text-xs text-slate-400">{a.duration_minutes}m</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/patients/${a.patient?.id}`}
                                        className="font-semibold text-slate-800 hover:text-teal-700 text-sm">
                                        {a.patient?.last_name}, {a.patient?.first_name}
                                    </Link>
                                    {a.chief_complaint && <p className="text-xs text-slate-500 mt-0.5 truncate">{a.chief_complaint}</p>}
                                    <div className="text-xs text-slate-400 mt-0.5">Dr. {a.dentist?.name}</div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <select value={a.status} onChange={e => setStatus(a.id, e.target.value)}
                                        className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                                        {['scheduled','confirmed','in_progress','completed','cancelled','no_show'].map(s => (
                                            <option key={s} value={s}>{s.replace('_',' ')}</option>
                                        ))}
                                    </select>
                                    <Link href={`/billing/create?patient_id=${a.patient?.id}`}
                                        className="text-xs px-2 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 whitespace-nowrap">
                                        + Invoice
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
