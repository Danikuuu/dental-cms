import {
    UserGroupIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/layouts/AppLayout';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(n);
const fmtTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
    });

const STATUS_PILL: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-teal-100 text-teal-700',
    in_progress: 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-600',
    no_show: 'bg-slate-100 text-slate-500',
};

export default function Dashboard({
    stats,
    today_appointments,
    recent_patients,
    monthly_collections,
}: any) {
    const cards = [
        {
            label: 'Total Patients',
            value: stats.patients_total.toLocaleString(),
            icon: UserGroupIcon,
            bg: 'bg-teal-50',
            ic: 'text-teal-600',
        },
        {
            label: "Today's Appointments",
            value: stats.appointments_today,
            icon: CalendarIcon,
            bg: 'bg-blue-50',
            ic: 'text-blue-600',
            sub: `${stats.appointments_pending} pending`,
        },
        {
            label: "Today's Collection",
            value: fmt(stats.collection_today),
            icon: CurrencyDollarIcon,
            bg: 'bg-green-50',
            ic: 'text-green-600',
        },
        {
            label: 'Monthly Collection',
            value: fmt(stats.collection_month),
            icon: ClipboardDocumentCheckIcon,
            bg: 'bg-purple-50',
            ic: 'text-purple-600',
        },
    ];

    const chartData = (monthly_collections ?? []).map((m: any) => ({
        month: new Date(m.month + '-01').toLocaleDateString('en-PH', {
            month: 'short',
        }),
        total: Number(m.total),
    }));

    return (
        <AppLayout title="Dashboard">
            <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
                {cards.map((c) => (
                    <div
                        key={c.label}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                {c.label}
                            </span>
                            <div
                                className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center`}
                            >
                                <c.icon className={`h-4 w-4 ${c.ic}`} />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-slate-800">
                            {c.value}
                        </div>
                        {c.sub && (
                            <div className="mt-0.5 text-xs text-slate-400">
                                {c.sub}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                        <h2 className="text-sm font-semibold text-slate-800">
                            Today's Schedule
                        </h2>
                        <Link
                            href="/appointments"
                            className="text-xs text-teal-600 hover:underline"
                        >
                            View all →
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {today_appointments?.length === 0 ? (
                            <div className="py-10 text-center text-sm text-slate-400">
                                No appointments today
                            </div>
                        ) : (
                            today_appointments?.map((a: any) => (
                                <div
                                    key={a.id}
                                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50"
                                >
                                    <div className="w-12 flex-shrink-0 text-center">
                                        <div className="text-xs font-bold text-teal-700">
                                            {fmtTime(a.scheduled_at)}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {a.duration_minutes}m
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/patients/${a.patient?.id}`}
                                            className="block truncate text-sm font-medium text-slate-800 hover:text-teal-700"
                                        >
                                            {a.patient?.last_name},{' '}
                                            {a.patient?.first_name}
                                        </Link>
                                        <div className="truncate text-xs text-slate-400">
                                            {a.chief_complaint ||
                                                'No complaint noted'}
                                        </div>
                                    </div>
                                    <div className="hidden max-w-24 truncate text-xs text-slate-400 md:block">
                                        {a.dentist?.name}
                                    </div>
                                    <span
                                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[a.status] ?? ''}`}
                                    >
                                        {a.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="mb-3 text-sm font-semibold text-slate-800">
                            Quick Actions
                        </h2>
                        <div className="space-y-2">
                            {[
                                {
                                    label: 'New Patient',
                                    href: '/patients/create',
                                    cls: 'bg-teal-50 text-teal-800 hover:bg-teal-100',
                                },
                                {
                                    label: 'Schedule Appointment',
                                    href: '/appointments',
                                    cls: 'bg-blue-50 text-blue-800 hover:bg-blue-100',
                                },
                                {
                                    label: 'Create Invoice',
                                    href: '/billing/create',
                                    cls: 'bg-green-50 text-green-800 hover:bg-green-100',
                                },
                                {
                                    label: 'Daily Report',
                                    href: '/reports/daily-collection',
                                    cls: 'bg-purple-50 text-purple-800 hover:bg-purple-100',
                                },
                            ].map((a) => (
                                <Link
                                    key={a.label}
                                    href={a.href}
                                    className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${a.cls}`}
                                >
                                    {a.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <h2 className="text-sm font-semibold text-slate-800">
                                Recent Patients
                            </h2>
                            <Link
                                href="/patients"
                                className="text-xs text-teal-600 hover:underline"
                            >
                                All →
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recent_patients?.map((p: any) => (
                                <Link
                                    key={p.id}
                                    href={`/patients/${p.id}`}
                                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50"
                                >
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                                        {p.first_name?.[0]}
                                        {p.last_name?.[0]}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium text-slate-800">
                                            {p.last_name}, {p.first_name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {p.patient_code}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {chartData.length > 0 && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-4 text-sm font-semibold text-slate-800">
                        Monthly Collections (₱)
                    </h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barSize={32}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickFormatter={(v) =>
                                    `₱${(v / 1000).toFixed(0)}k`
                                }
                            />
                            <Tooltip
                                formatter={(v: any) => [fmt(v), 'Collection']}
                                contentStyle={{
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    fontSize: 12,
                                }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#0d9488"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </AppLayout>
    );
}
