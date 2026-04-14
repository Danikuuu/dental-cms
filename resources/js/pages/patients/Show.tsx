import {
    store as storeDentalChart,
    destroy as destroyDentalChart,
} from '@/wayfinder/actions/App/Http/Controllers/DentalChartController';
import { store as storePatientImage } from '@/wayfinder/actions/App/Http/Controllers/PatientImageController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ExclamationTriangleIcon, PlusIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ─── Dental Chart ──────────────────────────────────────────────────────────
const CONDITIONS = [
    { v: 'caries',    l: 'Caries',    c: 'bg-red-500 text-white' },
    { v: 'missing',   l: 'Missing',   c: 'bg-slate-500 text-white' },
    { v: 'extracted', l: 'Extracted', c: 'bg-slate-700 text-white' },
    { v: 'crown',     l: 'Crown',     c: 'bg-yellow-500 text-white' },
    { v: 'rct',       l: 'RCT',       c: 'bg-purple-500 text-white' },
    { v: 'filling',   l: 'Filling',   c: 'bg-blue-500 text-white' },
    { v: 'bridge',    l: 'Bridge',    c: 'bg-orange-500 text-white' },
    { v: 'implant',   l: 'Implant',   c: 'bg-teal-500 text-white' },
    { v: 'healthy',   l: 'Healthy',   c: 'bg-green-500 text-white' },
];

const ADULT_UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const ADULT_LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
const PEDO_UPPER  = [55,54,53,52,51,61,62,63,64,65];
const PEDO_LOWER  = [85,84,83,82,81,71,72,73,74,75];

function ToothBtn({ n, entries, selected, onSelect }: any) {
    const entry = entries?.find((e: any) => e.tooth_number === String(n));
    const cond  = CONDITIONS.find(c => c.v === entry?.condition);
    return (
        <button type="button" onClick={() => onSelect(n)} title={`#${n}${entry ? ' — '+entry.condition : ''}`}
            className={`w-9 h-9 rounded-lg border-2 flex flex-col items-center justify-center transition-all text-xs font-bold
                ${selected ? 'border-teal-500 scale-110 shadow-md z-10' : 'border-slate-200 hover:border-slate-400'}
                ${cond ? cond.c : 'bg-white text-slate-500'}`}>
            {n}
        </button>
    );
}

function DentalChart({ patient, entries }: any) {
    const [chartType, setChartType] = useState<'adult'|'pedo'>('adult');
    const [selected, setSelected] = useState<number|null>(null);
    const ic = "w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500";

    const { data, setData, submit, processing, reset } = useForm({
        patient_id: patient.id, tooth_number: '', surface: '', condition: '',
        treatment: '', status: 'existing', chart_type: chartType,
        date_recorded: new Date().toISOString().split('T')[0], notes: '',
    });

    const filtered = entries?.filter((e: any) => e.chart_type === chartType) ?? [];
    const upper = chartType === 'adult' ? ADULT_UPPER : PEDO_UPPER;
    const lower = chartType === 'adult' ? ADULT_LOWER : PEDO_LOWER;

    const selectTooth = (n: number) => { setSelected(n); setData('tooth_number', String(n)); };

    // FIX: use Wayfinder storeDentalChart action instead of hardcoded '/dental-chart'
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(storeDentalChart(), {
            onSuccess: () => { reset('condition', 'treatment', 'notes', 'surface'); setSelected(null); },
        });
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    {(['adult','pedo'] as const).map(t => (
                        <button key={t} onClick={() => { setChartType(t); setSelected(null); }}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${chartType===t ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}>
                            {t === 'adult' ? 'Adult (FDI)' : 'Pedo (Primary)'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 overflow-x-auto">
                <div className="text-center text-xs text-slate-400 font-medium mb-2">UPPER</div>
                <div className="flex justify-center gap-1 mb-1.5">
                    {upper.map(n => <ToothBtn key={n} n={n} entries={filtered} selected={selected===n} onSelect={selectTooth} />)}
                </div>
                <div className="border-t-2 border-dashed border-slate-300 my-2" />
                <div className="flex justify-center gap-1 mt-1.5">
                    {lower.map(n => <ToothBtn key={n} n={n} entries={filtered} selected={selected===n} onSelect={selectTooth} />)}
                </div>
                <div className="text-center text-xs text-slate-400 font-medium mt-2">LOWER</div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {CONDITIONS.map(c => (
                    <span key={c.v} className="flex items-center gap-1 text-xs text-slate-600">
                        <span className={`w-3 h-3 rounded-sm ${c.c}`} />{c.l}
                    </span>
                ))}
            </div>

            {selected && (
                <form onSubmit={handleSubmit} className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
                    <div className="text-sm font-semibold text-teal-800 mb-3">Chart Entry — Tooth #{selected}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Condition *</label>
                            <select value={data.condition} onChange={e => setData('condition', e.target.value)} required className={ic}>
                                <option value="">Select…</option>
                                {CONDITIONS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Surface</label>
                            <input type="text" value={data.surface} onChange={e => setData('surface', e.target.value)} placeholder="M,D,O,B,L" className={ic} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Treatment Done</label>
                            <input type="text" value={data.treatment} onChange={e => setData('treatment', e.target.value)} className={ic} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Status</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className={ic}>
                                <option value="existing">Existing</option>
                                <option value="planned">Planned</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Notes…" className={ic + ' flex-1'} />
                        <button type="submit" disabled={processing || !data.condition}
                            className="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">Save</button>
                        <button type="button" onClick={() => setSelected(null)} className="px-3 py-1.5 border border-slate-200 text-sm rounded-lg">Cancel</button>
                    </div>
                </form>
            )}

            {filtered.length > 0 && (
                <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">History</div>
                    <div className="space-y-1">
                        {filtered.map((e: any) => (
                            <div key={e.id} className="flex items-center gap-3 text-sm bg-white border border-slate-100 rounded-lg px-3 py-2">
                                <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">#{e.tooth_number}</span>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CONDITIONS.find(c=>c.v===e.condition)?.c ?? 'bg-slate-300'}`} />
                                <span className="text-slate-700 capitalize">{e.condition}</span>
                                {e.treatment && <span className="text-slate-400">→ {e.treatment}</span>}
                                {e.surface && <span className="text-xs text-slate-400">({e.surface})</span>}
                                <span className="ml-auto text-xs text-slate-400">{e.date_recorded} · {e.dentist?.name}</span>
                                {/* FIX: use Wayfinder destroyDentalChart action */}
                                <button onClick={() => router.delete(destroyDentalChart(e.id).url, { preserveState: true })}
                                    className="p-1 text-red-300 hover:text-red-500 rounded ml-1">
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Imaging ───────────────────────────────────────────────────────────────
function Imaging({ patient, images }: any) {
    const { data, setData, submit, processing } = useForm<any>({
        patient_id: patient.id, image: null, type: 'xray',
        tooth_number: '', notes: '', date_taken: new Date().toISOString().split('T')[0],
    });
    const ic = "w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500";

    const [lightbox, setLightbox] = useState<any>(null);
    const [zoom, setZoom]         = useState(1);

    const openLightbox = (img: any) => { setLightbox(img); setZoom(1); };
    const closeLightbox = () => setLightbox(null);
    const zoomIn  = () => setZoom(z => Math.min(z + 0.25, 4));
    const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
    const resetZoom = () => setZoom(1);

    const handleDownload = (img: any) => {
        const a = document.createElement('a');
        a.href = img.url;
        a.download = img.original_name;
        a.target = '_blank';
        a.click();
    };

    // FIX: use Wayfinder storePatientImage action instead of hardcoded URL
    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(storePatientImage(patient.id), { forceFormData: true });
    };

    return (
        <div>
            {/* Upload form */}
            <form onSubmit={handleUploadSubmit} className="bg-slate-50 rounded-xl p-4 mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="col-span-2">
                        <label className="text-xs text-slate-500 mb-1 block">Image File *</label>
                        <input type="file" accept="image/*" required onChange={e => setData('image', e.target.files?.[0] ?? null)}
                            className="w-full text-sm text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-teal-50 file:text-teal-700 file:text-xs hover:file:bg-teal-100" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Type</label>
                        <select value={data.type} onChange={e => setData('type', e.target.value)} className={ic}>
                            {[['xray','X-Ray'],['intraoral','Intraoral'],['extraoral','Extraoral'],['document','Document'],['other','Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Tooth #</label>
                        <input type="text" value={data.tooth_number} onChange={e => setData('tooth_number', e.target.value)} className={ic} placeholder="Optional" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <input type="date" value={data.date_taken} onChange={e => setData('date_taken', e.target.value)} className={ic + ' w-40'} />
                    <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Notes…" className={ic + ' flex-1'} />
                    <button type="submit" disabled={processing}
                        className="flex items-center gap-1 px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">
                        <ArrowUpTrayIcon className="w-4 h-4" /> Upload
                    </button>
                </div>
            </form>

            {/* Gallery grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images?.length === 0 && <p className="col-span-4 text-sm text-slate-400 py-8 text-center">No images uploaded yet.</p>}
                {images?.map((img: any) => (
                    <div key={img.id} className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 cursor-pointer"
                        onClick={() => openLightbox(img)}>
                        <img src={img.url} alt={img.original_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                            <div className="flex justify-end">
                                <button onClick={e => { e.stopPropagation(); handleDownload(img); }}
                                    className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                                    title="Download">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                    </svg>
                                </button>
                            </div>
                            <div>
                                <div className="text-white text-xs font-medium truncate">{img.original_name}</div>
                                <div className="text-white/70 text-xs">{img.type} · {img.date_taken}</div>
                            </div>
                        </div>
                        <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded capitalize">{img.type}</span>
                    </div>
                ))}
            </div>

            {/* Lightbox modal */}
            {lightbox && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={closeLightbox}>
                    <div className="flex items-center justify-between px-5 py-3 bg-black/50 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <div className="text-white">
                            <div className="font-medium text-sm">{lightbox.original_name}</div>
                            <div className="text-white/60 text-xs capitalize">{lightbox.type} · {lightbox.date_taken}{lightbox.tooth_number ? ` · Tooth #${lightbox.tooth_number}` : ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={zoomOut} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg">–</button>
                            <button onClick={resetZoom} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg min-w-12 text-center">
                                {Math.round(zoom * 100)}%
                            </button>
                            <button onClick={zoomIn} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg">+</button>
                            <button onClick={() => handleDownload(lightbox)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs rounded-lg ml-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                                Download
                            </button>
                            <button onClick={closeLightbox} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg ml-1">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                        <img
                            src={lightbox.url}
                            alt={lightbox.original_name}
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease', maxWidth: '100%', maxHeight: '100%' }}
                        />
                    </div>
                    {lightbox.notes && (
                        <div className="px-5 py-3 bg-black/50 text-white/70 text-xs text-center flex-shrink-0" onClick={e => e.stopPropagation()}>
                            {lightbox.notes}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Show Page ────────────────────────────────────────────────────────
const TABS = ['Overview', 'Dental Chart', 'Imaging', 'Billing', 'Appointments'] as const;

export default function PatientShow({ patient }: any) {
    const [tab, setTab] = useState<typeof TABS[number]>('Overview');

    const flags = [
        ['Hypertension', patient.has_hypertension], ['Diabetes', patient.has_diabetes],
        ['Heart Disease', patient.has_heart_disease], ['Asthma', patient.has_asthma],
        ['Bleeding Disorder', patient.has_bleeding_disorder], ['Thyroid', patient.has_thyroid_disorder],
        ['Kidney Disease', patient.has_kidney_disease], ['Liver Disease', patient.has_liver_disease],
        ['Pregnant', patient.is_pregnant],
    ].filter(([, v]) => v);

    const fmt = (n: number) => `₱${Number(n).toLocaleString('en-PH',{minimumFractionDigits:2})}`;

    return (
        <AppLayout title={patient.full_name}>
            {/* Patient header card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-lg font-bold flex-shrink-0">
                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">{patient.full_name}</h1>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{patient.patient_code}</span>
                                    <span>{patient.age} yrs · {patient.sex}</span>
                                    {patient.blood_type && <span className="text-red-600 font-semibold">Blood: {patient.blood_type}</span>}
                                    {patient.phone && <span>{patient.phone}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                <Link href={`/patients/${patient.id}/timeline`} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">📋 Timeline</Link>
                                <Link href={`/patients/${patient.id}/edit`} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Edit</Link>
                                <Link href={`/billing/create?patient_id=${patient.id}`} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">+ Invoice</Link>
                            </div>
                        </div>
                        {flags.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-amber-700 font-medium">Medical Alerts:</span>
                                {flags.map(([l]) => <span key={l as string} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{l as string}</span>)}
                            </div>
                        )}
                        {patient.allergies && (
                            <div className="mt-2 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">
                                <strong>Allergies:</strong> {patient.allergies}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-4 overflow-x-auto">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${tab===t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                        {t}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
                {tab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Personal</div>
                            <dl className="space-y-2 text-sm">
                                {[
                                    ['Full Name',patient.full_name],['Date of Birth',patient.date_of_birth],
                                    ['Age',patient.age+' years'],['Sex',patient.sex],
                                    ['Civil Status',patient.civil_status],['Occupation',patient.occupation],
                                    ['Referred By',patient.referred_by],['PhilHealth #',patient.philhealth_number],
                                    ['Address',patient.address ? `${patient.address}, ${patient.city}, ${patient.province}` : null],
                                    ['Phone',patient.phone],['Email',patient.email],
                                ].filter(([,v])=>v).map(([k,v])=>(
                                    <div key={k as string} className="flex gap-3">
                                        <dt className="text-slate-400 w-28 flex-shrink-0 text-xs pt-0.5">{k}</dt>
                                        <dd className="text-slate-700">{v as string}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Medical</div>
                            {flags.length === 0 ? <p className="text-sm text-slate-400">No medical conditions flagged.</p> : (
                                <div className="flex flex-wrap gap-2 mb-4">{flags.map(([l])=><span key={l as string} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">{l as string}</span>)}</div>
                            )}
                            {patient.current_medications && <div className="mt-3 text-sm"><span className="text-xs font-medium text-slate-500 block mb-1">Medications</span><p className="text-slate-700">{patient.current_medications}</p></div>}
                            {patient.medical_notes && <div className="mt-3 text-sm"><span className="text-xs font-medium text-slate-500 block mb-1">Notes</span><p className="text-slate-700">{patient.medical_notes}</p></div>}

                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-6">Emergency Contact</div>
                            {patient.emergency_contact_name ? (
                                <dl className="space-y-2 text-sm">
                                    {[['Name',patient.emergency_contact_name],['Phone',patient.emergency_contact_phone],['Relation',patient.emergency_contact_relation]].filter(([,v])=>v).map(([k,v])=>(
                                        <div key={k as string} className="flex gap-3"><dt className="text-slate-400 w-20 flex-shrink-0 text-xs pt-0.5">{k}</dt><dd className="text-slate-700">{v as string}</dd></div>
                                    ))}
                                </dl>
                            ) : <p className="text-sm text-slate-400">No emergency contact on file.</p>}
                        </div>
                    </div>
                )}

                {tab === 'Dental Chart' && <DentalChart patient={patient} entries={patient.dental_chart_entries} />}
                {tab === 'Imaging' && <Imaging patient={patient} images={patient.images} />}

                {tab === 'Billing' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-700">Invoice History</h3>
                            <Link href={`/billing/create?patient_id=${patient.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
                                <PlusIcon className="w-4 h-4" /> New Invoice
                            </Link>
                        </div>
                        {patient.invoices?.length === 0 ? <p className="text-sm text-slate-400">No invoices yet.</p> : (
                            <div className="space-y-2">
                                {patient.invoices?.map((inv: any) => (
                                    <Link key={inv.id} href={`/billing/${inv.id}`}
                                        className="flex items-center justify-between px-4 py-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                        <div>
                                            <span className="font-mono text-xs text-slate-400">{inv.invoice_number}</span>
                                            <div className="text-sm font-medium text-slate-700 mt-0.5">{inv.invoice_date}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-slate-800">{fmt(inv.total_amount)}</div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status==='paid'?'bg-green-100 text-green-800':inv.status==='partial'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-600'}`}>{inv.status}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'Appointments' && (
                    <div>
                        {patient.appointments?.length === 0 ? <p className="text-sm text-slate-400">No appointment history.</p> : (
                            <div className="space-y-2">
                                {patient.appointments?.map((a: any) => (
                                    <div key={a.id} className="flex items-center gap-4 px-4 py-3 border border-slate-100 rounded-lg">
                                        <div className="text-sm font-medium text-slate-700 w-28 flex-shrink-0">{new Date(a.scheduled_at).toLocaleDateString('en-PH')}</div>
                                        <div className="text-xs text-slate-400 w-14 flex-shrink-0">{new Date(a.scheduled_at).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}</div>
                                        <div className="flex-1 text-sm text-slate-600 truncate">{a.chief_complaint || '—'}</div>
                                        <div className="text-xs text-slate-400 hidden md:block">Dr. {a.dentist?.name}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${a.status==='completed'?'bg-green-100 text-green-800':a.status==='cancelled'?'bg-red-100 text-red-600':'bg-blue-100 text-blue-700'}`}>{a.status.replace('_',' ')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
