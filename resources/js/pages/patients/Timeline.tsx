// FIX: the actions/index.ts exports the storeNote action as `note` (matching the route segment name).
// Import it directly from the TreatmentTimelineController actions file where it is named `storeNote`.
import {
    ArrowLeftIcon,
    PlusIcon,
    CalendarIcon,
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    CameraIcon,
    DocumentTextIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { storeNote as storeTimelineNote } from '@/wayfinder/actions/App/Http/Controllers/TreatmentTimelineController';

const fmt = (n: number) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const EVENT_CONFIG: Record<
    string,
    { icon: React.ElementType; color: string; bg: string }
> = {
    appointment: {
        icon: CalendarIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
    },
    chart_entry: {
        icon: ClipboardDocumentListIcon,
        color: 'text-teal-600',
        bg: 'bg-teal-100',
    },
    treatment_plan: {
        icon: DocumentTextIcon,
        color: 'text-purple-600',
        bg: 'bg-purple-100',
    },
    invoice: {
        icon: CurrencyDollarIcon,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
    },
    payment: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bg: 'bg-green-100',
    },
    image_upload: {
        icon: CameraIcon,
        color: 'text-slate-500',
        bg: 'bg-slate-100',
    },
    note: {
        icon: DocumentTextIcon,
        color: 'text-slate-500',
        bg: 'bg-slate-100',
    },
};

const ICON_OVERRIDE: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100   text-red-500',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100  text-blue-600',
    teal: 'bg-teal-100  text-teal-600',
    purple: 'bg-purple-100 text-purple-600',
    slate: 'bg-slate-100 text-slate-500',
};

interface TimelineEvent {
    id: string;
    date: string;
    time: string | null;
    event_type: string;
    title: string;
    description: string | null;
    meta: string | null;
    status: string | null;
    icon_color: string;
    amount?: number;
    link?: string;
    thumb?: string;
}

function TimelineItem({ event }: { event: TimelineEvent }) {
    const cfg = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.note;
    const iconCls =
        ICON_OVERRIDE[event.icon_color] ?? 'bg-slate-100 text-slate-500';
    const Icon = cfg.icon;

    const content = (
        <div className="flex items-start gap-4">
            <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${iconCls}`}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pb-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="text-sm leading-tight font-medium text-slate-800">
                            {event.title}
                        </div>
                        {event.description && (
                            <p className="mt-0.5 truncate text-sm text-slate-500">
                                {event.description}
                            </p>
                        )}
                        {event.meta && (
                            <p className="mt-0.5 text-xs text-slate-400">
                                {event.meta}
                            </p>
                        )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-slate-400">
                            {event.time ?? ''}
                        </div>
                        {event.amount != null && event.amount > 0 && (
                            <div
                                className={`mt-0.5 text-sm font-semibold ${event.event_type === 'payment' ? 'text-green-700' : 'text-slate-700'}`}
                            >
                                {fmt(event.amount)}
                            </div>
                        )}
                    </div>
                </div>
                {event.thumb && (
                    <img
                        src={event.thumb}
                        alt="thumb"
                        className="mt-2 h-16 w-16 rounded-lg border border-slate-200 object-cover"
                    />
                )}
            </div>
        </div>
    );

    return event.link ? (
        <Link
            href={event.link}
            className="-mx-4 block rounded-xl px-4 transition-colors hover:bg-slate-50"
        >
            {content}
        </Link>
    ) : (
        <div>{content}</div>
    );
}

export default function PatientTimeline({ patient, timeline, stats }: any) {
    const [showNote, setShowNote] = useState(false);
    const noteForm = useForm({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
    });

    const ic =
        'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    // FIX: use the Wayfinder typed action instead of a hardcoded URL string.
    const handleNoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        noteForm.submit(storeTimelineNote(patient.id), {
            onSuccess: () => {
                noteForm.reset();
                setShowNote(false);
            },
        });
    };

    return (
        <AppLayout title={`${patient.full_name} — Timeline`}>
            {/* Back link */}
            <Link
                href={`/patients/${patient.id}`}
                className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600"
            >
                <ArrowLeftIcon className="h-4 w-4" /> Back to Patient
            </Link>

            {/* Patient mini-header */}
            <div className="mb-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                    {patient.first_name?.[0]}
                    {patient.last_name?.[0]}
                </div>
                <div>
                    <div className="font-bold text-slate-800">
                        {patient.full_name}
                    </div>
                    <div className="text-xs text-slate-400">
                        {patient.patient_code} · {patient.age} yrs ·{' '}
                        {patient.sex}
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-6 text-center">
                    {[
                        { label: 'Events', value: stats.total_events },
                        {
                            label: 'Appointments',
                            value: stats.total_appointments,
                        },
                        { label: 'Total Paid', value: fmt(stats.total_paid) },
                        {
                            label: 'First Visit',
                            value: stats.first_visit ?? '—',
                        },
                    ].map((s) => (
                        <div key={s.label}>
                            <div className="text-base font-bold text-slate-800">
                                {s.value}
                            </div>
                            <div className="text-xs text-slate-400">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add note button */}
            <div className="mb-5 flex justify-end">
                <button
                    onClick={() => setShowNote((v) => !v)}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                    <PlusIcon className="h-4 w-4" /> Add Note
                </button>
            </div>

            {showNote && (
                <div className="mb-5 rounded-xl border border-teal-200 bg-white p-5">
                    <h3 className="mb-3 font-semibold text-slate-700">
                        Add Timeline Note
                    </h3>
                    <form onSubmit={handleNoteSubmit}>
                        <div className="mb-3 grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={noteForm.data.title}
                                    required
                                    onChange={(e) =>
                                        noteForm.setData(
                                            'title',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="e.g. Patient called to reschedule"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={noteForm.data.event_date}
                                    onChange={(e) =>
                                        noteForm.setData(
                                            'event_date',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Details
                                </label>
                                <textarea
                                    value={noteForm.data.description}
                                    rows={2}
                                    onChange={(e) =>
                                        noteForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className={ic + ' resize-none'}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowNote(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={noteForm.processing}
                                className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                Add Note
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Timeline */}
            {Object.keys(timeline).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
                    <CalendarIcon className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">No treatment history yet.</p>
                    <Link
                        href={`/appointments`}
                        className="mt-2 text-sm text-teal-600 hover:underline"
                    >
                        Schedule first appointment →
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(timeline).map(
                        ([month, events]: [string, any]) => (
                            <div key={month}>
                                {/* Month header */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                        {month}
                                    </div>
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <div className="text-xs text-slate-300">
                                        {(events as any[]).length} event
                                        {(events as any[]).length !== 1
                                            ? 's'
                                            : ''}
                                    </div>
                                </div>

                                {/* Events for this month */}
                                <div className="relative rounded-xl border border-slate-200 bg-white px-5 pt-4">
                                    {/* Vertical connector line */}
                                    <div className="absolute top-8 bottom-4 left-[2.85rem] w-px bg-slate-100" />

                                    {(events as TimelineEvent[]).map(
                                        (event) => (
                                            <div
                                                key={event.id}
                                                className="relative"
                                            >
                                                <TimelineItem event={event} />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </AppLayout>
    );
}
