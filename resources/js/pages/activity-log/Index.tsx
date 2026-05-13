import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

const ACTION_STYLE: Record<string, string> = {
    login: 'bg-green-100 text-green-700',
    logout: 'bg-slate-100 text-slate-500',
    create_patient: 'bg-teal-100 text-teal-700',
    update_patient: 'bg-blue-100 text-blue-700',
    delete_patient: 'bg-red-100 text-red-600',
    create_treatment_plan: 'bg-purple-100 text-purple-700',
    update_treatment_plan: 'bg-blue-100 text-blue-700',
    issue_or: 'bg-amber-100 text-amber-700',
    inventory_transaction: 'bg-orange-100 text-orange-700',
    send_sms: 'bg-cyan-100 text-cyan-700',
    bulk_sms: 'bg-cyan-100 text-cyan-700',
    create_employee: 'bg-indigo-100 text-indigo-700',
    create_claim: 'bg-pink-100 text-pink-700',
    update_claim: 'bg-pink-100 text-pink-700',
};

export default function ActivityLogIndex({ logs, filters }: any) {
    const [date, setDate] = useState(filters?.date ?? '');
    const [action, setAction] = useState(filters?.action ?? '');

    const apply = () =>
        router.get('/activity-log', { date, action }, { preserveState: true });

    return (
        <AppLayout title="Activity Log">
            <div className="max-w-5xl">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="Filter by action…"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <button
                        onClick={apply}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                        Filter
                    </button>
                    {(date || action) && (
                        <button
                            onClick={() => {
                                setDate('');
                                setAction('');
                                router.get(
                                    '/activity-log',
                                    {},
                                    { preserveState: true },
                                );
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                        <ShieldCheckIcon className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-semibold text-slate-700">
                            System Activity
                        </h3>
                        <span className="ml-auto text-xs text-slate-400">
                            {logs.total} entries
                        </span>
                    </div>

                    {logs.data?.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            No activity recorded
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {logs.data?.map((log: any) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50"
                                >
                                    <div className="w-32 flex-shrink-0 pt-0.5">
                                        <div className="text-xs font-medium text-slate-700">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleDateString('en-PH', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleTimeString('en-PH', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                    <div className="w-28 flex-shrink-0 pt-0.5">
                                        <div className="truncate text-xs font-medium text-slate-700">
                                            {log.user?.name ?? 'System'}
                                        </div>
                                        <div className="text-xs text-slate-400 capitalize">
                                            {log.user?.role ?? ''}
                                        </div>
                                    </div>
                                    <div className="w-44 flex-shrink-0 pt-0.5">
                                        <span
                                            className={`inline-block rounded-full px-2 py-0.5 font-mono text-xs ${ACTION_STYLE[log.action] ?? 'bg-slate-100 text-slate-600'}`}
                                        >
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                        <p className="truncate text-sm text-slate-700">
                                            {log.description}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 pt-0.5 text-xs text-slate-300">
                                        {log.ip_address}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {logs.links && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                            <span>
                                Showing {logs.from}–{logs.to} of {logs.total}
                            </span>
                            <div className="flex gap-1">
                                {logs.links.map((l: any, i: number) => (
                                    <a
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
            </div>
        </AppLayout>
    );
}
