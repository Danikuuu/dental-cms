import {
    send as sendSms,
    bulkReminders as bulkSms,
    cancel as cancelSms,
    saveSettings as saveSmsSettings,
    toggle as toggleSms,
} from '@/wayfinder/actions/App/Http/Controllers/SmsController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

const STATUS_PILL: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800',
    sent:      'bg-green-100 text-green-800',
    failed:    'bg-red-100 text-red-600',
    cancelled: 'bg-slate-100 text-slate-500',
};

const DEFAULT_TEMPLATE = 'Hi {{patient_name}}, this is a reminder for your appointment on {{date}} at {{time}} at {{clinic_name}}. Please call us if you need to reschedule.';

export default function SmsIndex({ reminders, filters, stats, settings }: any) {
    const [tab, setTab] = useState<'reminders'|'send'|'bulk'|'settings'>('reminders');

    const sendForm = useForm({
        patient_id:     '',
        phone_number:   '',
        message:        '',
        type:           'custom',
        appointment_id: '',
        scheduled_at:   '',
    });

    const bulkForm = useForm({
        date:             new Date().toISOString().split('T')[0],
        hours_before:     24,
        message_template: DEFAULT_TEMPLATE,
    });

    const settingsForm = useForm({
        sms_provider:    settings?.provider ?? 'semaphore',
        sms_api_key:     settings?.api_key ?? '',
        sms_sender_name: settings?.sender_name ?? 'DENTAL',
        sms_enabled:     settings?.enabled ?? false,
    });

    return (
        <AppLayout title="SMS Reminders">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Pending', value: stats.pending, cls: 'bg-amber-50 border border-amber-200 text-amber-800' },
                    { label: 'Sent',    value: stats.sent,    cls: 'bg-green-50 border border-green-200 text-green-800' },
                    { label: 'Failed',  value: stats.failed,  cls: 'bg-red-50 border border-red-200 text-red-700' },
                    { label: 'Today',   value: stats.today,   cls: 'bg-white border border-slate-200 text-slate-800' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
                        <div className="text-xs mb-1 opacity-70">{s.label}</div>
                        <div className="text-2xl font-bold">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* SMS enabled banner */}
            {!settings?.enabled && (
                <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 flex-shrink-0" />
                    <span>SMS sending is currently <strong>disabled</strong>. Messages will be queued but not delivered.</span>
                    {settings?.has_api_key && (
                        <button onClick={() => router.post(toggleSms().url, {}, { preserveState: false })}
                            className="ml-auto px-3 py-1 bg-amber-600 text-white rounded-lg text-xs hover:bg-amber-700">
                            Enable SMS
                        </button>
                    )}
                    {!settings?.has_api_key && (
                        <button onClick={() => setTab('settings')} className="ml-auto px-3 py-1 border border-amber-600 text-amber-700 rounded-lg text-xs hover:bg-amber-100">
                            Configure →
                        </button>
                    )}
                </div>
            )}

            {settings?.enabled && (
                <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    SMS sending is <strong>enabled</strong> via {settings.provider} · Sender: <strong>{settings.sender_name}</strong>
                    <button onClick={() => router.post(toggleSms().url, {}, { preserveState: false })}
                        className="ml-auto px-3 py-1 border border-green-600 text-green-700 rounded-lg text-xs hover:bg-green-100">
                        Disable
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-5 overflow-x-auto">
                {(['reminders','send','bulk','settings'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap
                            ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                        {t === 'bulk' ? 'Bulk Send' : t}
                    </button>
                ))}
            </div>

            {/* Reminders list */}
            {tab === 'reminders' && (
                <div>
                    <div className="flex gap-3 mb-4 flex-wrap">
                        <select value={filters?.status ?? ''}
                            onChange={e => router.get('/sms', { ...filters, status: e.target.value }, { preserveState: true })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                            <option value="">All Statuses</option>
                            {Object.keys(STATUS_PILL).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <input type="date" value={filters?.date ?? ''}
                            onChange={e => router.get('/sms', { ...filters, date: e.target.value }, { preserveState: true })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        {['Patient','Phone','Message','Type','Scheduled','Status',''].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reminders.data?.length === 0 ? (
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No SMS reminders found</td></tr>
                                    ) : reminders.data?.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                {r.patient ? (
                                                    <Link href={`/patients/${r.patient.id}`} className="font-medium text-slate-800 hover:text-teal-700 text-sm">
                                                        {r.patient.last_name}, {r.patient.first_name}
                                                    </Link>
                                                ) : <span className="text-slate-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs font-mono">{r.phone_number}</td>
                                            <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate">{r.message}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs capitalize">{r.type.replace('_', ' ')}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                                {r.scheduled_at ? new Date(r.scheduled_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_PILL[r.status] ?? ''}`}>
                                                    {r.status}
                                                </span>
                                                {r.error_message && (
                                                    <div className="text-xs text-red-500 mt-0.5 max-w-32 truncate" title={r.error_message}>
                                                        {r.error_message}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.status === 'pending' && (
                                                    <button onClick={() => router.delete(cancelSms(r.id).url, { preserveState: true })}
                                                        className="text-xs text-red-500 hover:underline">Cancel</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {reminders.links && (
                            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Showing {reminders.from}–{reminders.to} of {reminders.total}</span>
                                <div className="flex gap-1">
                                    {reminders.links.map((l: any, i: number) => (
                                        <Link key={i} href={l.url ?? '#'}
                                            className={`px-2.5 py-1 rounded text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'opacity-40 pointer-events-none' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: l.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Send single SMS */}
            {tab === 'send' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-2xl">
                    <h3 className="font-semibold text-slate-700 mb-5">Send SMS</h3>
                    <form onSubmit={e => { e.preventDefault(); sendForm.submit(sendSms(), { onSuccess: () => sendForm.reset() }); }}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Patient ID *</label>
                                <input type="number" value={sendForm.data.patient_id} required onChange={e => sendForm.setData('patient_id', e.target.value)} className={ic} placeholder="Patient ID" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Phone Number *</label>
                                <input type="text" value={sendForm.data.phone_number} required onChange={e => sendForm.setData('phone_number', e.target.value)} className={ic} placeholder="09XX XXX XXXX" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Type *</label>
                                <select value={sendForm.data.type} onChange={e => sendForm.setData('type', e.target.value)} className={ic}>
                                    {['appointment_reminder','follow_up','custom'].map(t => (
                                        <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Schedule (leave blank to send now)</label>
                                <input type="datetime-local" value={sendForm.data.scheduled_at} onChange={e => sendForm.setData('scheduled_at', e.target.value)} className={ic} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Message * <span className="text-slate-300">(max 160 chars)</span></label>
                                <textarea value={sendForm.data.message} required maxLength={160} rows={4}
                                    onChange={e => sendForm.setData('message', e.target.value)}
                                    className={ic + ' resize-none'} />
                                <div className="text-xs text-slate-400 mt-1 text-right">{sendForm.data.message.length}/160</div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="submit" disabled={sendForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {sendForm.processing ? 'Sending…' : 'Send SMS'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bulk send */}
            {tab === 'bulk' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-2xl">
                    <h3 className="font-semibold text-slate-700 mb-2">Bulk Appointment Reminders</h3>
                    <p className="text-sm text-slate-500 mb-5">Send reminders to all scheduled/confirmed patients for a specific date.</p>
                    <form onSubmit={e => { e.preventDefault(); bulkForm.submit(bulkSms(), { onSuccess: () => {} }); }}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Appointment Date *</label>
                                <input type="date" value={bulkForm.data.date} required onChange={e => bulkForm.setData('date', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Send X hours before *</label>
                                <select value={bulkForm.data.hours_before} onChange={e => bulkForm.setData('hours_before', Number(e.target.value))} className={ic}>
                                    {[1,2,3,6,12,24].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''} before</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">
                                    Message Template * <span className="text-slate-300 font-mono">{'{{patient_name}} {{time}} {{date}} {{clinic_name}}'}</span>
                                </label>
                                <textarea value={bulkForm.data.message_template} required maxLength={160} rows={4}
                                    onChange={e => bulkForm.setData('message_template', e.target.value)}
                                    className={ic + ' resize-none font-mono text-xs'} />
                                <div className="text-xs text-slate-400 mt-1 text-right">{bulkForm.data.message_template.length}/160</div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="submit" disabled={bulkForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {bulkForm.processing ? 'Sending…' : 'Send Bulk Reminders'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Settings */}
            {tab === 'settings' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-xl">
                    <h3 className="font-semibold text-slate-700 mb-5">SMS Settings</h3>
                    <form onSubmit={e => { e.preventDefault(); settingsForm.submit(saveSmsSettings(), { onSuccess: () => {} }); }}>
                        <div className="space-y-4 mb-5">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">SMS Provider *</label>
                                <select value={settingsForm.data.sms_provider} onChange={e => settingsForm.setData('sms_provider', e.target.value)} className={ic}>
                                    <option value="semaphore">Semaphore (PH)</option>
                                    <option value="globe_labs">Globe Labs</option>
                                    <option value="infobip">Infobip</option>
                                    <option value="manual">Manual (disabled)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">API Key</label>
                                <input type="text" value={settingsForm.data.sms_api_key}
                                    onChange={e => settingsForm.setData('sms_api_key', e.target.value)}
                                    className={ic} placeholder={settings?.has_api_key ? '••••••••' : 'Enter API key'} />
                                {settings?.has_api_key && (
                                    <p className="text-xs text-slate-400 mt-1">Leave blank to keep existing key</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Sender Name <span className="text-slate-300">(max 11 chars)</span></label>
                                <input type="text" maxLength={11} value={settingsForm.data.sms_sender_name}
                                    onChange={e => settingsForm.setData('sms_sender_name', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox"
                                        checked={settingsForm.data.sms_enabled}
                                        onChange={e => settingsForm.setData('sms_enabled', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                    <span className="text-sm text-slate-700">Enable SMS sending</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="submit" disabled={settingsForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {settingsForm.processing ? 'Saving…' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
