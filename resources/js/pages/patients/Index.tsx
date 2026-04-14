import AppLayout from '@/layouts/AppLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function PatientsIndex({ patients, filters }: any) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const submit = (e: React.FormEvent) => { e.preventDefault(); router.get('/patients', { search }, { preserveState: true }); };
    const age = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 864e5));

    return (
        <AppLayout title="Patients">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <form onSubmit={submit} className="flex gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, code, phone…"
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">Search</button>
                </form>
                <Link href="/patients/create" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    <PlusIcon className="w-4 h-4" /> New Patient
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {['Patient', 'Code', 'Age / Sex', 'Contact', 'Registered', ''].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.data?.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No patients found</td></tr>
                            ) : patients.data?.map((p: any) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-semibold flex-shrink-0">
                                                {p.first_name?.[0]}{p.last_name?.[0]}
                                            </div>
                                            <Link href={`/patients/${p.id}`} className="font-medium text-slate-800 hover:text-teal-700">
                                                {p.last_name}, {p.first_name} {p.middle_name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{p.patient_code}</span></td>
                                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{age(p.date_of_birth)} yrs · {p.sex}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{p.phone || '—'}</td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(p.created_at).toLocaleDateString('en-PH')}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Link href={`/patients/${p.id}`} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><EyeIcon className="w-4 h-4" /></Link>
                                            <Link href={`/patients/${p.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {patients.links && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing {patients.from}–{patients.to} of {patients.total}</span>
                        <div className="flex gap-1">
                            {patients.links.map((l: any, i: number) => (
                                <Link key={i} href={l.url ?? '#'}
                                    className={`px-2.5 py-1 rounded text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: l.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
