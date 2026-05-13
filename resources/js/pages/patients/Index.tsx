import {
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

export default function PatientsIndex({ patients, filters }: any) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [nowMs] = useState(() => Date.now());
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/patients', { search }, { preserveState: true });
    };
    const age = (dob: string) =>
        Math.floor((nowMs - new Date(dob).getTime()) / (365.25 * 864e5));

    return (
        <AppLayout title="Patients">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <form onSubmit={submit} className="flex max-w-md flex-1 gap-2">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, code, phone…"
                            className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                        Search
                    </button>
                </form>
                <Link
                    href="/patients/create"
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                    <PlusIcon className="h-4 w-4" /> New Patient
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {[
                                    'Patient',
                                    'Code',
                                    'Age / Sex',
                                    'Contact',
                                    'Registered',
                                    '',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-slate-400"
                                    >
                                        No patients found
                                    </td>
                                </tr>
                            ) : (
                                patients.data?.map((p: any) => (
                                    <tr
                                        key={p.id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                                                    {p.first_name?.[0]}
                                                    {p.last_name?.[0]}
                                                </div>
                                                <Link
                                                    href={`/patients/${p.id}`}
                                                    className="font-medium text-slate-800 hover:text-teal-700"
                                                >
                                                    {p.last_name},{' '}
                                                    {p.first_name}{' '}
                                                    {p.middle_name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">
                                                {p.patient_code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                            {age(p.date_of_birth)} yrs · {p.sex}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {p.phone || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-400">
                                            {new Date(
                                                p.created_at,
                                            ).toLocaleDateString('en-PH')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/patients/${p.id}`}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/patients/${p.id}/edit`}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {patients.links && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                        <span>
                            Showing {patients.from}–{patients.to} of{' '}
                            {patients.total}
                        </span>
                        <div className="flex gap-1">
                            {patients.links.map((l: any, i: number) => (
                                <Link
                                    key={i}
                                    href={l.url ?? '#'}
                                    className={`rounded px-2.5 py-1 text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: l.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
