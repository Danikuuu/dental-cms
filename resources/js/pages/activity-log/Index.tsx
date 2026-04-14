import AppLayout from '@/layouts/AppLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const ACTION_STYLE: Record<string, string> = {
    login:                  'bg-green-100 text-green-700',
    logout:                 'bg-slate-100 text-slate-500',
    create_patient:         'bg-teal-100 text-teal-700',
    update_patient:         'bg-blue-100 text-blue-700',
    delete_patient:         'bg-red-100 text-red-600',
    create_treatment_plan:  'bg-purple-100 text-purple-700',
    update_treatment_plan:  'bg-blue-100 text-blue-700',
    issue_or:               'bg-amber-100 text-amber-700',
    inventory_transaction:  'bg-orange-100 text-orange-700',
    send_sms:               'bg-cyan-100 text-cyan-700',
    bulk_sms:               'bg-cyan-100 text-cyan-700',
    create_employee:        'bg-indigo-100 text-indigo-700',
    create_claim:           'bg-pink-100 text-pink-700',
    update_claim:           'bg-pink-100 text-pink-700',
};

export default function ActivityLogIndex({ logs, filters }: any) {
    const [date,   setDate]   = useState(filters?.date   ?? '');
    const [action, setAction] = useState(filters?.action ?? '');

    const apply = () => router.get('/activity-log', { date, action }, { preserveState: true });

    return (
        <AppLayout title="Activity Log">
            <div className="max-w-5xl">
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <input type="text" value={action} onChange={e => setAction(e.target.value)}
                        placeholder="Filter by action…"
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <button onClick={apply} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">Filter</button>
                    {(date || action) && (
                        <button onClick={() => { setDate(''); setAction(''); router.get('/activity-log', {}, { preserveState: true }); }}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50">Clear</button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                        <h3 className="font-semibold text-slate-700 text-sm">System Activity</h3>
                        <span className="ml-auto text-xs text-slate-400">{logs.total} entries</span>
                    </div>

                    {logs.data?.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">No activity recorded</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {logs.data?.map((log: any) => (
                                <div key={log.id} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50">
                                    <div className="w-32 flex-shrink-0 pt-0.5">
                                        <div className="text-xs text-slate-700 font-medium">
                                            {new Date(log.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(log.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="w-28 flex-shrink-0 pt-0.5">
                                        <div className="text-xs font-medium text-slate-700 truncate">{log.user?.name ?? 'System'}</div>
                                        <div className="text-xs text-slate-400 capitalize">{log.user?.role ?? ''}</div>
                                    </div>
                                    <div className="w-44 flex-shrink-0 pt-0.5">
                                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-mono ${ACTION_STYLE[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-sm text-slate-700 truncate">{log.description}</p>
                                    </div>
                                    <div className="text-xs text-slate-300 flex-shrink-0 pt-0.5">{log.ip_address}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {logs.links && (
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Showing {logs.from}–{logs.to} of {logs.total}</span>
                            <div className="flex gap-1">
                                {logs.links.map((l: any, i: number) => (
                                    <a key={i} href={l.url ?? '#'}
                                        className={`px-2.5 py-1 rounded text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'opacity-40 pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: l.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
