import {
    HomeIcon,
    UserGroupIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    ClipboardDocumentListIcon,
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon,
    ArchiveBoxIcon,
    UserIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { destroy as logoutAction } from '@/wayfinder/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function AppLayout({ children, title }: Props) {
    const [open, setOpen] = useState(false);
    const { auth, flash, clinic } = usePage().props as any;
    const can = (auth as any)?.can ?? {};
    const role = (auth as any)?.user?.role ?? '';
    const path = window.location.pathname;

    // FIX: use prefix-matching for section roots, not just individual routes.
    // This ensures sub-pages (e.g. /reports/patient-visits) keep the nav item highlighted.
    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return path === '/dashboard';
        }

        // For reports, match the entire /reports prefix
        if (href === '/reports/daily-collection') {
            return path.startsWith('/reports');
        }

        return path.startsWith(href);
    };

    const navGroups = [
        {
            label: 'Clinical',
            items: [
                {
                    name: 'Dashboard',
                    href: '/dashboard',
                    icon: HomeIcon,
                    show: true,
                },
                {
                    name: 'Patients',
                    href: '/patients',
                    icon: UserGroupIcon,
                    show: true,
                },
                {
                    name: 'Appointments',
                    href: '/appointments',
                    icon: CalendarIcon,
                    show: true,
                },
                {
                    name: 'Treatment Plans',
                    href: '/treatment-plans',
                    icon: ClipboardDocumentListIcon,
                    show: true,
                },
            ],
        },
        {
            label: 'Finance',
            items: [
                {
                    name: 'Billing',
                    href: '/billing',
                    icon: CurrencyDollarIcon,
                    show: true,
                },
                {
                    name: 'Insurance',
                    href: '/insurance',
                    icon: ShieldExclamationIcon,
                    show: true,
                },
            ],
        },
        {
            label: 'Operations',
            items: [
                {
                    name: 'SMS Reminders',
                    href: '/sms',
                    icon: ChatBubbleLeftRightIcon,
                    show: true,
                },
                {
                    name: 'Inventory',
                    href: '/inventory',
                    icon: ArchiveBoxIcon,
                    show: true,
                },
                {
                    name: 'Employees',
                    href: '/employees',
                    icon: UserIcon,
                    show: can.manage_settings,
                },
                {
                    name: 'Reports',
                    href: '/reports/daily-collection',
                    icon: ChartBarIcon,
                    show: can.view_reports,
                },
            ],
        },
        {
            label: 'System',
            items: [
                {
                    name: 'Templates',
                    href: '/templates',
                    icon: DocumentTextIcon,
                    show: true,
                },
                {
                    name: 'Settings',
                    href: '/settings',
                    icon: Cog6ToothIcon,
                    show: can.manage_settings,
                },
                {
                    name: 'Activity Log',
                    href: '/activity-log',
                    icon: ShieldCheckIcon,
                    show: can.manage_settings,
                },
            ],
        },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {open && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                >
                    <div className="absolute inset-0 bg-slate-900/50" />
                </div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-300 lg:relative lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-700/60 px-5 py-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-500">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                            <path d="M12 2C9.24 2 7 4.24 7 7c0 1.67.78 3.15 2 4.12V20a1 1 0 001 1h4a1 1 0 001-1v-8.88C16.22 10.15 17 8.67 17 7c0-2.76-2.24-5-5-5z" />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">
                            {(clinic as any)?.name ?? 'DentalCare'}
                        </div>
                        <div className="text-xs text-slate-400">
                            Clinic System
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="flex-shrink-0 text-slate-400 hover:text-white lg:hidden"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
                    {navGroups.map((group) => {
                        const visible = group.items.filter((i) => i.show);

                        if (!visible.length) {
                            return null;
                        }

                        return (
                            <div key={group.label}>
                                <div className="mb-1 px-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
                                    {group.label}
                                </div>
                                <div className="space-y-0.5">
                                    {visible.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${isActive(item.href) ? 'bg-teal-600 font-medium text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                        >
                                            <item.icon className="h-4 w-4 flex-shrink-0" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="flex-shrink-0 border-t border-slate-700/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                            {(auth as any)?.user?.name?.charAt(0) ?? 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-white">
                                {(auth as any)?.user?.name}
                            </div>
                            <div className="text-xs text-slate-400 capitalize">
                                {role}
                            </div>
                        </div>
                        <Link
                            href={logoutAction()}
                            method="delete"
                            as="button"
                            className="text-slate-400 transition-colors hover:text-white"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5">
                    <button
                        onClick={() => setOpen(true)}
                        className="text-slate-500 lg:hidden"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    {title && (
                        <h1 className="flex-1 text-base font-semibold text-slate-800">
                            {title}
                        </h1>
                    )}
                    <div className="ml-auto text-xs text-slate-400">
                        {new Date().toLocaleDateString('en-PH', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>
                </header>

                {(flash as any)?.success && (
                    <div className="mx-5 mt-4 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                        <svg
                            className="h-4 w-4 flex-shrink-0 text-teal-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {(flash as any).success}
                    </div>
                )}
                {(flash as any)?.error && (
                    <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {(flash as any).error}
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-5">{children}</main>
            </div>
        </div>
    );
}
