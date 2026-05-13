import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import {
    send as sendSms,
    bulkReminders as bulkSms,
    cancel as cancelSms,
    saveSettings as saveSmsSettings,
    toggle as toggleSms,
} from '@/wayfinder/actions/App/Http/Controllers/SmsController';

const ic =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

const STATUS_PILL: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-600',
    cancelled: 'bg-slate-100 text-slate-500',
};

const DEFAULT_TEMPLATE =
    'Hi {{patient_name}}, this is a reminder for your appointment on {{date}} at {{time}} at {{clinic_name}}. Please call us if you need to reschedule.';

export default function SmsIndex({ reminders, filters, stats, settings }: any) {
    const [tab, setTab] = useState<'reminders' | 'send' | 'bulk' | 'settings'>(
        'reminders',
    );

    const sendForm = useForm({
        patient_id: '',
        phone_number: '',
        message: '',
        type: 'custom',
        appointment_id: '',
        scheduled_at: '',
    });

    const bulkForm = useForm({
        date: new Date().toISOString().split('T')[0],
        hours_before: 24,
        message_template: DEFAULT_TEMPLATE,
    });

    const settingsForm = useForm({
        sms_provider: settings?.provider ?? 'semaphore',
        sms_api_key: settings?.api_key ?? '',
        sms_sender_name: settings?.sender_name ?? 'DENTAL',
        sms_enabled: settings?.enabled ?? false,
    });

    return (
        <AppLayout title="SMS Reminders">
            {/* Stats */}
            <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    {
                        label: 'Pending',
                        value: stats.pending,
                        cls: 'bg-amber-50 border border-amber-200 text-amber-800',
                    },
                    {
                        label: 'Sent',
                        value: stats.sent,
                        cls: 'bg-green-50 border border-green-200 text-green-800',
                    },
                    {
                        label: 'Failed',
                        value: stats.failed,
                        cls: 'bg-red-50 border border-red-200 text-red-700',
                    },
                    {
                        label: 'Today',
                        value: stats.today,
                        cls: 'bg-white border border-slate-200 text-slate-800',
                    },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
                        <div className="mb-1 text-xs opacity-70">{s.label}</div>
                        <div className="text-2xl font-bold">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* SMS enabled banner */}
            {!settings?.enabled && (
                <div className="mb-5 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 flex-shrink-0" />
                    <span>
                        SMS sending is currently <strong>disabled</strong>.
                        Messages will be queued but not delivered.
                    </span>
                    {settings?.has_api_key && (
                        <button
                            onClick={() =>
                                router.post(
                                    toggleSms().url,
                                    {},
                                    { preserveState: false },
                                )
                            }
                            className="ml-auto rounded-lg bg-amber-600 px-3 py-1 text-xs text-white hover:bg-amber-700"
                        >
                            Enable SMS
                        </button>
                    )}
                    {!settings?.has_api_key && (
                        <button
                            onClick={() => setTab('settings')}
                            className="ml-auto rounded-lg border border-amber-600 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100"
                        >
                            Configure →
                        </button>
                    )}
                </div>
            )}

            {settings?.enabled && (
                <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                    SMS sending is <strong>enabled</strong> via{' '}
                    {settings.provider} · Sender:{' '}
                    <strong>{settings.sender_name}</strong>
                    <button
                        onClick={() =>
                            router.post(
                                toggleSms().url,
                                {},
                                { preserveState: false },
                            )
                        }
                        className="ml-auto rounded-lg border border-green-600 px-3 py-1 text-xs text-green-700 hover:bg-green-100"
                    >
                        Disable
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
                {(['reminders', 'send', 'bulk', 'settings'] as const).map(
                    (t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap capitalize transition-all ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            {t === 'bulk' ? 'Bulk Send' : t}
                        </button>
                    ),
                )}
            </div>

            {/* Reminders list */}
            {tab === 'reminders' && (
                <div>
                    <div className="mb-4 flex flex-wrap gap-3">
                        <select
                            value={filters?.status ?? ''}
                            onChange={(e) =>
                                router.get(
                                    '/sms',
                                    { ...filters, status: e.target.value },
                                    { preserveState: true },
                                )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                            <option value="">All Statuses</option>
                            {Object.keys(STATUS_PILL).map((s) => (
                                <option
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                >
                                    {s}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={filters?.date ?? ''}
                            onChange={(e) =>
                                router.get(
                                    '/sms',
                                    { ...filters, date: e.target.value },
                                    { preserveState: true },
                                )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        {[
                                            'Patient',
                                            'Phone',
                                            'Message',
                                            'Type',
                                            'Scheduled',
                                            'Status',
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
                                    {reminders.data?.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-12 text-center text-slate-400"
                                            >
                                                No SMS reminders found
                                            </td>
                                        </tr>
                                    ) : (
                                        reminders.data?.map((r: any) => (
                                            <tr
                                                key={r.id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-3">
                                                    {r.patient ? (
                                                        <Link
                                                            href={`/patients/${r.patient.id}`}
                                                            className="text-sm font-medium text-slate-800 hover:text-teal-700"
                                                        >
                                                            {
                                                                r.patient
                                                                    .last_name
                                                            }
                                                            ,{' '}
                                                            {
                                                                r.patient
                                                                    .first_name
                                                            }
                                                        </Link>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                                    {r.phone_number}
                                                </td>
                                                <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-600">
                                                    {r.message}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500 capitalize">
                                                    {r.type.replace('_', ' ')}
                                                </td>
                                                <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                                    {r.scheduled_at
                                                        ? new Date(
                                                              r.scheduled_at,
                                                          ).toLocaleString(
                                                              'en-PH',
                                                              {
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                              },
                                                          )
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_PILL[r.status] ?? ''}`}
                                                    >
                                                        {r.status}
                                                    </span>
                                                    {r.error_message && (
                                                        <div
                                                            className="mt-0.5 max-w-32 truncate text-xs text-red-500"
                                                            title={
                                                                r.error_message
                                                            }
                                                        >
                                                            {r.error_message}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {r.status === 'pending' && (
                                                        <button
                                                            onClick={() =>
                                                                router.delete(
                                                                    cancelSms(
                                                                        r.id,
                                                                    ).url,
                                                                    {
                                                                        preserveState: true,
                                                                    },
                                                                )
                                                            }
                                                            className="text-xs text-red-500 hover:underline"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {reminders.links && (
                            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                                <span>
                                    Showing {reminders.from}–{reminders.to} of{' '}
                                    {reminders.total}
                                </span>
                                <div className="flex gap-1">
                                    {reminders.links.map(
                                        (l: any, i: number) => (
                                            <Link
                                                key={i}
                                                href={l.url ?? '#'}
                                                className={`rounded px-2.5 py-1 text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'pointer-events-none opacity-40' : ''}`}
                                                dangerouslySetInnerHTML={{
                                                    __html: l.label,
                                                }}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Send single SMS */}
            {tab === 'send' && (
                <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-5 font-semibold text-slate-700">
                        Send SMS
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendForm.submit(sendSms(), {
                                onSuccess: () => sendForm.reset(),
                            });
                        }}
                    >
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Patient ID *
                                </label>
                                <input
                                    type="number"
                                    value={sendForm.data.patient_id}
                                    required
                                    onChange={(e) =>
                                        sendForm.setData(
                                            'patient_id',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="Patient ID"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Phone Number *
                                </label>
                                <input
                                    type="text"
                                    value={sendForm.data.phone_number}
                                    required
                                    onChange={(e) =>
                                        sendForm.setData(
                                            'phone_number',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="09XX XXX XXXX"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Type *
                                </label>
                                <select
                                    value={sendForm.data.type}
                                    onChange={(e) =>
                                        sendForm.setData('type', e.target.value)
                                    }
                                    className={ic}
                                >
                                    {[
                                        'appointment_reminder',
                                        'follow_up',
                                        'custom',
                                    ].map((t) => (
                                        <option
                                            key={t}
                                            value={t}
                                            className="capitalize"
                                        >
                                            {t.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Schedule (leave blank to send now)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={sendForm.data.scheduled_at}
                                    onChange={(e) =>
                                        sendForm.setData(
                                            'scheduled_at',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Message *{' '}
                                    <span className="text-slate-300">
                                        (max 160 chars)
                                    </span>
                                </label>
                                <textarea
                                    value={sendForm.data.message}
                                    required
                                    maxLength={160}
                                    rows={4}
                                    onChange={(e) =>
                                        sendForm.setData(
                                            'message',
                                            e.target.value,
                                        )
                                    }
                                    className={ic + ' resize-none'}
                                />
                                <div className="mt-1 text-right text-xs text-slate-400">
                                    {sendForm.data.message.length}/160
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                disabled={sendForm.processing}
                                className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {sendForm.processing ? 'Sending…' : 'Send SMS'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bulk send */}
            {tab === 'bulk' && (
                <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-2 font-semibold text-slate-700">
                        Bulk Appointment Reminders
                    </h3>
                    <p className="mb-5 text-sm text-slate-500">
                        Send reminders to all scheduled/confirmed patients for a
                        specific date.
                    </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            bulkForm.submit(bulkSms(), { onSuccess: () => {} });
                        }}
                    >
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Appointment Date *
                                </label>
                                <input
                                    type="date"
                                    value={bulkForm.data.date}
                                    required
                                    onChange={(e) =>
                                        bulkForm.setData('date', e.target.value)
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Send X hours before *
                                </label>
                                <select
                                    value={bulkForm.data.hours_before}
                                    onChange={(e) =>
                                        bulkForm.setData(
                                            'hours_before',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={ic}
                                >
                                    {[1, 2, 3, 6, 12, 24].map((h) => (
                                        <option key={h} value={h}>
                                            {h} hour{h > 1 ? 's' : ''} before
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Message Template *{' '}
                                    <span className="font-mono text-slate-300">
                                        {
                                            '{{patient_name}} {{time}} {{date}} {{clinic_name}}'
                                        }
                                    </span>
                                </label>
                                <textarea
                                    value={bulkForm.data.message_template}
                                    required
                                    maxLength={160}
                                    rows={4}
                                    onChange={(e) =>
                                        bulkForm.setData(
                                            'message_template',
                                            e.target.value,
                                        )
                                    }
                                    className={
                                        ic + ' resize-none font-mono text-xs'
                                    }
                                />
                                <div className="mt-1 text-right text-xs text-slate-400">
                                    {bulkForm.data.message_template.length}/160
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                disabled={bulkForm.processing}
                                className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {bulkForm.processing
                                    ? 'Sending…'
                                    : 'Send Bulk Reminders'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Settings */}
            {tab === 'settings' && (
                <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-5 font-semibold text-slate-700">
                        SMS Settings
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            settingsForm.submit(saveSmsSettings(), {
                                onSuccess: () => {},
                            });
                        }}
                    >
                        <div className="mb-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    SMS Provider *
                                </label>
                                <select
                                    value={settingsForm.data.sms_provider}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'sms_provider',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                >
                                    <option value="semaphore">
                                        Semaphore (PH)
                                    </option>
                                    <option value="globe_labs">
                                        Globe Labs
                                    </option>
                                    <option value="infobip">Infobip</option>
                                    <option value="manual">
                                        Manual (disabled)
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    API Key
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.data.sms_api_key}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'sms_api_key',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder={
                                        settings?.has_api_key
                                            ? '••••••••'
                                            : 'Enter API key'
                                    }
                                />
                                {settings?.has_api_key && (
                                    <p className="mt-1 text-xs text-slate-400">
                                        Leave blank to keep existing key
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Sender Name{' '}
                                    <span className="text-slate-300">
                                        (max 11 chars)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={11}
                                    value={settingsForm.data.sms_sender_name}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'sms_sender_name',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={settingsForm.data.sms_enabled}
                                        onChange={(e) =>
                                            settingsForm.setData(
                                                'sms_enabled',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-slate-700">
                                        Enable SMS sending
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {settingsForm.processing
                                    ? 'Saving…'
                                    : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
