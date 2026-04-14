// FIX: the actions/index.ts exports the storeNote action as `note` (matching the route segment name).
// Import it directly from the TreatmentTimelineController actions file where it is named `storeNote`.
import { storeNote as storeTimelineNote } from '@/wayfinder/actions/App/Http/Controllers/TreatmentTimelineController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeftIcon, PlusIcon, CalendarIcon, ClipboardDocumentListIcon,
    CurrencyDollarIcon, CameraIcon, DocumentTextIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';

const fmt = (n: number) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    appointment:    { icon: CalendarIcon,              color: 'text-blue-600',   bg: 'bg-blue-100' },
    chart_entry:    { icon: ClipboardDocumentListIcon, color: 'text-teal-600',   bg: 'bg-teal-100' },
    treatment_plan: { icon: DocumentTextIcon,          color: 'text-purple-600', bg: 'bg-purple-100' },
    invoice:        { icon: CurrencyDollarIcon,        color: 'text-amber-600',  bg: 'bg-amber-100' },
    payment:        { icon: CheckCircleIcon,           color: 'text-green-600',  bg: 'bg-green-100' },
    image_upload:   { icon: CameraIcon,                color: 'text-slate-500',  bg: 'bg-slate-100' },
    note:           { icon: DocumentTextIcon,          color: 'text-slate-500',  bg: 'bg-slate-100' },
};

const ICON_OVERRIDE: Record<string, string> = {
    green:  'bg-green-100 text-green-600',
    red:    'bg-red-100   text-red-500',
    amber:  'bg-amber-100 text-amber-600',
    blue:   'bg-blue-100  text-blue-600',
    teal:   'bg-teal-100  text-teal-600',
    purple: 'bg-purple-100 text-purple-600',
    slate:  'bg-slate-100 text-slate-500',
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
    const iconCls = ICON_OVERRIDE[event.icon_color] ?? 'bg-slate-100 text-slate-500';
    const Icon = cfg.icon;

    const content = (
        <div className="flex items-start gap-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 text-sm leading-tight">{event.title}</div>
                        {event.description && <p className="text-sm text-slate-500 mt-0.5 truncate">{event.description}</p>}
                        {event.meta && <p className="text-xs text-slate-400 mt-0.5">{event.meta}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-400">{event.time ?? ''}</div>
                        {event.amount != null && event.amount > 0 && (
                            <div className={`text-sm font-semibold mt-0.5 ${event.event_type==='payment'?'text-green-700':'text-slate-700'}`}>
                                {fmt(event.amount)}
                            </div>
                        )}
                    </div>
                </div>
                {event.thumb && (
                    <img src={event.thumb} alt="thumb" className="mt-2 w-16 h-16 object-cover rounded-lg border border-slate-200" />
                )}
            </div>
        </div>
    );

    return event.link ? (
        <Link href={event.link} className="block hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors">
            {content}
        </Link>
    ) : (
        <div>{content}</div>
    );
}

export default function PatientTimeline({ patient, timeline, stats }: any) {
    const [showNote, setShowNote] = useState(false);
    const noteForm = useForm({
        title: '', description: '', event_date: new Date().toISOString().split('T')[0],
    });

    const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    // FIX: use the Wayfinder typed action instead of a hardcoded URL string.
    const handleNoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        noteForm.submit(storeTimelineNote(patient.id), {
            onSuccess: () => { noteForm.reset(); setShowNote(false); },
        });
    };

    return (
        <AppLayout title={`${patient.full_name} — Timeline`}>
            {/* Back link */}
            <Link href={`/patients/${patient.id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-5">
                <ArrowLeftIcon className="w-4 h-4"/> Back to Patient
            </Link>

            {/* Patient mini-header */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                </div>
                <div>
                    <div className="font-bold text-slate-800">{patient.full_name}</div>
                    <div className="text-xs text-slate-400">{patient.patient_code} · {patient.age} yrs · {patient.sex}</div>
                </div>
                <div className="ml-auto flex items-center gap-6 text-center">
                    {[
                        { label:'Events',        value: stats.total_events },
                        { label:'Appointments',  value: stats.total_appointments },
                        { label:'Total Paid',    value: fmt(stats.total_paid) },
                        { label:'First Visit',   value: stats.first_visit ?? '—' },
                    ].map(s=>(
                        <div key={s.label}>
                            <div className="text-base font-bold text-slate-800">{s.value}</div>
                            <div className="text-xs text-slate-400">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add note button */}
            <div className="flex justify-end mb-5">
                <button onClick={()=>setShowNote(v=>!v)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                    <PlusIcon className="w-4 h-4"/> Add Note
                </button>
            </div>

            {showNote && (
                <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5">
                    <h3 className="font-semibold text-slate-700 mb-3">Add Timeline Note</h3>
                    <form onSubmit={handleNoteSubmit}>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Title *</label>
                                <input type="text" value={noteForm.data.title} required
                                    onChange={e=>noteForm.setData('title',e.target.value)}
                                    className={ic} placeholder="e.g. Patient called to reschedule"/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Date</label>
                                <input type="date" value={noteForm.data.event_date}
                                    onChange={e=>noteForm.setData('event_date',e.target.value)} className={ic}/>
                            </div>
                            <div className="col-span-3">
                                <label className="text-xs text-slate-500 mb-1 block">Details</label>
                                <textarea value={noteForm.data.description} rows={2}
                                    onChange={e=>noteForm.setData('description',e.target.value)}
                                    className={ic+' resize-none'}/>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={()=>setShowNote(false)}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                            <button type="submit" disabled={noteForm.processing}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                Add Note
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Timeline */}
            {Object.keys(timeline).length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
                    <CalendarIcon className="w-10 h-10 mb-3 opacity-30"/>
                    <p className="text-sm">No treatment history yet.</p>
                    <Link href={`/appointments`} className="mt-2 text-teal-600 text-sm hover:underline">Schedule first appointment →</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(timeline).map(([month, events]: [string, any]) => (
                        <div key={month}>
                            {/* Month header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{month}</div>
                                <div className="flex-1 h-px bg-slate-200"/>
                                <div className="text-xs text-slate-300">{(events as any[]).length} event{(events as any[]).length!==1?'s':''}</div>
                            </div>

                            {/* Events for this month */}
                            <div className="bg-white rounded-xl border border-slate-200 px-5 pt-4 relative">
                                {/* Vertical connector line */}
                                <div className="absolute left-[2.85rem] top-8 bottom-4 w-px bg-slate-100"/>

                                {(events as TimelineEvent[]).map((event) => (
                                    <div key={event.id} className="relative">
                                        <TimelineItem event={event} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
