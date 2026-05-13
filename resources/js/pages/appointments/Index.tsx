import {
    PlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import {
    store as storeAppointment,
    update as updateAppointment,
} from '@/wayfinder/actions/App/Http/Controllers/AppointmentController';

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'border-l-blue-400 bg-blue-50/40',
    confirmed: 'border-l-teal-400 bg-teal-50/40',
    in_progress: 'border-l-amber-400 bg-amber-50/40',
    completed: 'border-l-green-400 bg-green-50/40',
    cancelled: 'border-l-slate-300 bg-slate-50/40 opacity-60',
    no_show: 'border-l-red-300 bg-red-50/30',
};

export default function AppointmentsIndex({
    appointments,
    dentists,
    filters,
}: any) {
    const today = new Date().toISOString().split('T')[0];
    const [viewDate, setViewDate] = useState(filters?.date ?? today);
    const [showForm, setShowForm] = useState(false);
    const ic =
        'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    const { data, setData, submit, processing, reset } = useForm({
        patient_id: '',
        dentist_id: '',
        scheduled_at: viewDate + 'T09:00',
        duration_minutes: 30,
        chief_complaint: '',
        notes: '',
    });

    const goDate = (d: string) => {
        setViewDate(d);
        router.get(
            '/appointments',
            { ...filters, date: d },
            { preserveState: true },
        );
    };
    const shift = (days: number) => {
        const d = new Date(viewDate);
        d.setDate(d.getDate() + days);
        goDate(d.toISOString().split('T')[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(storeAppointment(), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    // FIX: use Wayfinder typed action instead of hardcoded router.put URL
    const setStatus = (id: number, status: string) =>
        router.put(
            updateAppointment(id).url,
            { status },
            { preserveState: true },
        );

    const fmtTime = (dt: string) =>
        new Date(dt).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    const fmtDate = (d: string) =>
        new Date(d + 'T00:00').toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    return (
        <AppLayout title="Appointments">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => shift(-1)}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                    >
                        <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
                    </button>
                    <input
                        type="date"
                        value={viewDate}
                        onChange={(e) => goDate(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <button
                        onClick={() => shift(1)}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                    >
                        <ChevronRightIcon className="h-4 w-4 text-slate-600" />
                    </button>
                    {viewDate !== today && (
                        <button
                            onClick={() => goDate(today)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            Today
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filters?.dentist_id ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/appointments',
                                {
                                    ...filters,
                                    date: viewDate,
                                    dentist_id: e.target.value,
                                },
                                { preserveState: true },
                            )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                        <option value="">All Dentists</option>
                        {dentists?.map((d: any) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                        <PlusIcon className="h-4 w-4" /> Schedule
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="mb-4 rounded-xl border border-teal-200 bg-white p-5">
                    <h3 className="mb-4 font-semibold text-slate-700">
                        Schedule New Appointment
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Patient ID *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter Patient ID"
                                    required
                                    value={data.patient_id}
                                    onChange={(e) =>
                                        setData('patient_id', e.target.value)
                                    }
                                    className={ic}
                                />
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Find the ID on the Patients page
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Dentist *
                                </label>
                                <select
                                    value={data.dentist_id}
                                    onChange={(e) =>
                                        setData('dentist_id', e.target.value)
                                    }
                                    required
                                    className={ic}
                                >
                                    <option value="">Select…</option>
                                    {dentists?.map((d: any) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) =>
                                        setData('scheduled_at', e.target.value)
                                    }
                                    required
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Duration
                                </label>
                                <select
                                    value={data.duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'duration_minutes',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={ic}
                                >
                                    {[15, 30, 45, 60, 90, 120].map((m) => (
                                        <option key={m} value={m}>
                                            {m} mins
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Chief Complaint
                                </label>
                                <input
                                    type="text"
                                    value={data.chief_complaint}
                                    onChange={(e) =>
                                        setData(
                                            'chief_complaint',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="Reason for visit…"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {processing ? 'Scheduling…' : 'Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <h2 className="text-sm font-semibold text-slate-700">
                        {fmtDate(viewDate)}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {appointments.data?.length ?? 0} appointment(s)
                    </p>
                </div>

                {appointments.data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <CalendarIcon className="mb-3 h-10 w-10 opacity-30" />
                        <p className="text-sm">No appointments for this day</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-2 text-sm text-teal-600 hover:underline"
                        >
                            Schedule one →
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {appointments.data?.map((a: any) => (
                            <div
                                key={a.id}
                                className={`flex items-start gap-4 border-l-4 px-5 py-4 ${STATUS_COLORS[a.status] ?? ''}`}
                            >
                                <div className="w-16 flex-shrink-0 pt-0.5 text-center">
                                    <div className="text-sm font-bold text-slate-700">
                                        {fmtTime(a.scheduled_at)}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {a.duration_minutes}m
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/patients/${a.patient?.id}`}
                                        className="text-sm font-semibold text-slate-800 hover:text-teal-700"
                                    >
                                        {a.patient?.last_name},{' '}
                                        {a.patient?.first_name}
                                    </Link>
                                    {a.chief_complaint && (
                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                            {a.chief_complaint}
                                        </p>
                                    )}
                                    <div className="mt-0.5 text-xs text-slate-400">
                                        Dr. {a.dentist?.name}
                                    </div>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <select
                                        value={a.status}
                                        onChange={(e) =>
                                            setStatus(a.id, e.target.value)
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                                    >
                                        {[
                                            'scheduled',
                                            'confirmed',
                                            'in_progress',
                                            'completed',
                                            'cancelled',
                                            'no_show',
                                        ].map((s) => (
                                            <option key={s} value={s}>
                                                {s.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={`/billing/create?patient_id=${a.patient?.id}`}
                                        className="rounded-lg bg-teal-50 px-2 py-1.5 text-xs whitespace-nowrap text-teal-700 hover:bg-teal-100"
                                    >
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
