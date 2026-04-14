import { ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { destroy as logoutAction } from '@/wayfinder/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import {
    HomeIcon, UserGroupIcon, CalendarIcon, CurrencyDollarIcon,
    ChartBarIcon, DocumentTextIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon,
    ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, ShieldCheckIcon,
    ChatBubbleLeftRightIcon, ArchiveBoxIcon, UserIcon, ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

interface Props { children: ReactNode; title?: string; }

export default function AppLayout({ children, title }: Props) {
    const [open, setOpen] = useState(false);
    const { auth, flash, clinic } = usePage().props as any;
    const can  = (auth as any)?.can ?? {};
    const role = (auth as any)?.user?.role ?? '';
    const path = window.location.pathname;

    // FIX: use prefix-matching for section roots, not just individual routes.
    // This ensures sub-pages (e.g. /reports/patient-visits) keep the nav item highlighted.
    const isActive = (href: string) => {
        if (href === '/dashboard') return path === '/dashboard';
        // For reports, match the entire /reports prefix
        if (href === '/reports/daily-collection') return path.startsWith('/reports');
        return path.startsWith(href);
    };

    const navGroups = [
        {
            label: 'Clinical',
            items: [
                { name: 'Dashboard',       href: '/dashboard',                icon: HomeIcon,                   show: true },
                { name: 'Patients',        href: '/patients',                 icon: UserGroupIcon,               show: true },
                { name: 'Appointments',    href: '/appointments',             icon: CalendarIcon,                show: true },
                { name: 'Treatment Plans', href: '/treatment-plans',          icon: ClipboardDocumentListIcon,   show: true },
            ],
        },
        {
            label: 'Finance',
            items: [
                { name: 'Billing',         href: '/billing',                  icon: CurrencyDollarIcon,          show: true },
                { name: 'Insurance',       href: '/insurance',                icon: ShieldExclamationIcon,       show: true },
            ],
        },
        {
            label: 'Operations',
            items: [
                { name: 'SMS Reminders',   href: '/sms',                      icon: ChatBubbleLeftRightIcon,     show: true },
                { name: 'Inventory',       href: '/inventory',                icon: ArchiveBoxIcon,              show: true },
                { name: 'Employees',       href: '/employees',                icon: UserIcon,                    show: can.manage_settings },
                { name: 'Reports',         href: '/reports/daily-collection', icon: ChartBarIcon,                show: can.view_reports },
            ],
        },
        {
            label: 'System',
            items: [
                { name: 'Templates',       href: '/templates',                icon: DocumentTextIcon,            show: true },
                { name: 'Settings',        href: '/settings',                 icon: Cog6ToothIcon,               show: can.manage_settings },
                { name: 'Activity Log',    href: '/activity-log',             icon: ShieldCheckIcon,             show: can.manage_settings },
            ],
        },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {open && (
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
                    <div className="absolute inset-0 bg-slate-900/50" />
                </div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60 flex-shrink-0">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                            <path d="M12 2C9.24 2 7 4.24 7 7c0 1.67.78 3.15 2 4.12V20a1 1 0 001 1h4a1 1 0 001-1v-8.88C16.22 10.15 17 8.67 17 7c0-2.76-2.24-5-5-5z"/>
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm truncate">{(clinic as any)?.name ?? 'DentalCare'}</div>
                        <div className="text-slate-400 text-xs">Clinic System</div>
                    </div>
                    <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white flex-shrink-0">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
                    {navGroups.map(group => {
                        const visible = group.items.filter(i => i.show);
                        if (!visible.length) return null;
                        return (
                            <div key={group.label}>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1">{group.label}</div>
                                <div className="space-y-0.5">
                                    {visible.map(item => (
                                        <Link key={item.name} href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive(item.href) ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                            <item.icon className="w-4 h-4 flex-shrink-0" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="px-4 py-3 border-t border-slate-700/60 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {(auth as any)?.user?.name?.charAt(0) ?? 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">{(auth as any)?.user?.name}</div>
                            <div className="text-slate-400 text-xs capitalize">{role}</div>
                        </div>
                        <Link href={logoutAction()} method="delete" as="button"
                            className="text-slate-400 hover:text-white transition-colors">
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-5 flex-shrink-0">
                    <button onClick={() => setOpen(true)} className="lg:hidden text-slate-500">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    {title && <h1 className="text-base font-semibold text-slate-800 flex-1">{title}</h1>}
                    <div className="ml-auto text-xs text-slate-400">
                        {new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </header>

                {(flash as any)?.success && (
                    <div className="mx-5 mt-4 px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {(flash as any).success}
                    </div>
                )}
                {(flash as any)?.error && (
                    <div className="mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        {(flash as any).error}
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-5">{children}</main>
            </div>
        </div>
    );
}
