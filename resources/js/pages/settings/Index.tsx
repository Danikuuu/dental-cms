import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import {
    store as storeService,
    update as updateService,
    destroy as destroyService,
} from '@/wayfinder/actions/App/Http/Controllers/ServiceController';
import {
    updateClinic as updateClinicAction,
    storeUser as storeUserAction,
    updateUser as updateUserAction,
} from '@/wayfinder/actions/App/Http/Controllers/SettingsController';

const ic =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number | string) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    dentist: 'Dentist',
    staff: 'Staff',
    receptionist: 'Receptionist',
};
const ROLE_PILL: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    dentist: 'bg-teal-100 text-teal-800',
    staff: 'bg-blue-100 text-blue-700',
    receptionist: 'bg-slate-100 text-slate-600',
};

export default function SettingsIndex({ clinic, services, users }: any) {
    const [tab, setTab] = useState<'clinic' | 'services' | 'users'>('clinic');
    const [editService, setEditService] = useState<any>(null);
    const [editUser, setEditUser] = useState<any>(null);
    const [showAddUser, setShowAddUser] = useState(false);

    // ── Clinic settings form ──────────────────────────────────────────────
    const clinicForm = useForm({
        clinic_name: clinic?.clinic_name ?? '',
        clinic_address: clinic?.clinic_address ?? '',
        clinic_phone: clinic?.clinic_phone ?? '',
        clinic_email: clinic?.clinic_email ?? '',
        clinic_tin: clinic?.clinic_tin ?? '',
        vat_registered:
            clinic?.vat_registered === 'true' || clinic?.vat_registered === '1',
        vat_percent: clinic?.vat_percent ?? 12,
        receipt_footer: clinic?.receipt_footer ?? '',
    });

    // ── Service forms ─────────────────────────────────────────────────────
    const serviceForm = useForm({
        name: '',
        category: '',
        base_fee: 0,
        description: '',
        code: '',
        is_vat_inclusive: false,
    });
    const editServiceForm = useForm({
        name: '',
        category: '',
        base_fee: 0,
        description: '',
        code: '',
        is_vat_inclusive: false,
        is_active: true,
    });

    const openEditService = (s: any) => {
        setEditService(s);
        editServiceForm.setData({
            name: s.name,
            category: s.category,
            base_fee: Number(s.base_fee),
            description: s.description ?? '',
            code: s.code ?? '',
            is_vat_inclusive: s.is_vat_inclusive,
            is_active: s.is_active,
        });
    };

    // ── User forms ────────────────────────────────────────────────────────
    const addUserForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        phone: '',
        license_number: '',
    });
    const editUserForm = useForm({
        name: '',
        role: 'staff',
        phone: '',
        license_number: '',
        password: '',
    });

    const openEditUser = (u: any) => {
        setEditUser(u);
        editUserForm.setData({
            name: u.name,
            role: u.role,
            phone: u.phone ?? '',
            license_number: u.license_number ?? '',
            password: '',
        });
    };

    // Group services by category
    const grouped = (services ?? []).reduce(
        (acc: any, s: any) => {
            (acc[s.category] ??= []).push(s);

            return acc;
        },
        {} as Record<string, any[]>,
    );

    return (
        <AppLayout title="Settings">
            {/* Tabs */}
            <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(['clinic', 'services', 'users'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition-all ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Clinic tab ─────────────────────────────────────────────── */}
            {tab === 'clinic' && (
                <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-5 font-semibold text-slate-700">
                        Clinic Information
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            clinicForm.submit(updateClinicAction(), {
                                onSuccess: () => {},
                            });
                        }}
                    >
                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Clinic Name *
                                </label>
                                <input
                                    type="text"
                                    value={clinicForm.data.clinic_name}
                                    required
                                    onChange={(e) =>
                                        clinicForm.setData(
                                            'clinic_name',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={clinicForm.data.clinic_address}
                                    onChange={(e) =>
                                        clinicForm.setData(
                                            'clinic_address',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={clinicForm.data.clinic_phone}
                                    onChange={(e) =>
                                        clinicForm.setData(
                                            'clinic_phone',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={clinicForm.data.clinic_email}
                                    onChange={(e) =>
                                        clinicForm.setData(
                                            'clinic_email',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    TIN
                                </label>
                                <input
                                    type="text"
                                    value={clinicForm.data.clinic_tin}
                                    onChange={(e) =>
                                        clinicForm.setData(
                                            'clinic_tin',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    VAT %
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={clinicForm.data.vat_percent}
                                    onChange={(e) =>
                                        clinicForm.setData(
                                            'vat_percent',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-3 flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={clinicForm.data.vat_registered}
                                        onChange={(e) =>
                                            clinicForm.setData(
                                                'vat_registered',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-slate-700">
                                        VAT Registered
                                    </span>
                                </label>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Receipt Footer
                                </label>
                                <textarea
                                    rows={3}
                                    value={clinicForm.data.receipt_footer}
                                    onChange={(e) =>
                                        clinicForm.setData(
                                            'receipt_footer',
                                            e.target.value,
                                        )
                                    }
                                    className={ic + ' resize-none'}
                                    placeholder="Thank you for choosing us!"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={clinicForm.processing}
                                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {clinicForm.processing
                                    ? 'Saving…'
                                    : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Services tab ───────────────────────────────────────────── */}
            {tab === 'services' && (
                <div>
                    {/* Add service */}
                    <div className="mb-5 rounded-xl border border-teal-200 bg-white p-5">
                        <h3 className="mb-4 font-semibold text-slate-700">
                            Add Service
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                serviceForm.submit(storeService(), {
                                    onSuccess: () => serviceForm.reset(),
                                });
                            }}
                        >
                            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.data.name}
                                        required
                                        onChange={(e) =>
                                            serviceForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Category *
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.data.category}
                                        required
                                        onChange={(e) =>
                                            serviceForm.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                        placeholder="e.g. Restorative"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Base Fee (₱) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={serviceForm.data.base_fee}
                                        required
                                        onChange={(e) =>
                                            serviceForm.setData(
                                                'base_fee',
                                                Number(e.target.value),
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Code
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.data.code}
                                        onChange={(e) =>
                                            serviceForm.setData(
                                                'code',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                        placeholder="e.g. D1110"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.data.description}
                                        onChange={(e) =>
                                            serviceForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            serviceForm.data.is_vat_inclusive
                                        }
                                        onChange={(e) =>
                                            serviceForm.setData(
                                                'is_vat_inclusive',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-teal-600"
                                    />
                                    <span className="text-sm text-slate-600">
                                        VAT Inclusive
                                    </span>
                                </label>
                                <button
                                    type="submit"
                                    disabled={serviceForm.processing}
                                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                >
                                    <PlusIcon className="h-4 w-4" />{' '}
                                    {serviceForm.processing
                                        ? 'Adding…'
                                        : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Service catalog */}
                    {Object.entries(grouped).map(
                        ([category, svcs]: [string, any]) => (
                            <div
                                key={category}
                                className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white"
                            >
                                <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        {category}
                                    </h3>
                                </div>
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-slate-100">
                                        {svcs.map((s: any) => (
                                            <tr
                                                key={s.id}
                                                className={`hover:bg-slate-50 ${!s.is_active ? 'opacity-40' : ''}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-800">
                                                        {s.name}
                                                    </div>
                                                    {s.code && (
                                                        <div className="font-mono text-xs text-slate-400">
                                                            {s.code}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                                                    {s.description}
                                                </td>
                                                <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-800">
                                                    {fmt(s.base_fee)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-400">
                                                    {s.is_vat_inclusive
                                                        ? 'VAT incl.'
                                                        : ''}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {!s.is_active ? (
                                                        <span className="text-xs text-slate-400">
                                                            Inactive
                                                        </span>
                                                    ) : (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    openEditService(
                                                                        s,
                                                                    )
                                                                }
                                                                className="rounded p-1.5 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    router.delete(
                                                                        destroyService(
                                                                            s.id,
                                                                        ).url,
                                                                        {
                                                                            preserveState: false,
                                                                        },
                                                                    )
                                                                }
                                                                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ),
                    )}
                </div>
            )}

            {/* Edit service modal */}
            {editService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700">
                                Edit Service
                            </h3>
                            <button onClick={() => setEditService(null)}>
                                <XMarkIcon className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                editServiceForm.submit(
                                    updateService(editService.id),
                                    { onSuccess: () => setEditService(null) },
                                );
                            }}
                        >
                            <div className="mb-4 grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editServiceForm.data.name}
                                        required
                                        onChange={(e) =>
                                            editServiceForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Category *
                                    </label>
                                    <input
                                        type="text"
                                        value={editServiceForm.data.category}
                                        required
                                        onChange={(e) =>
                                            editServiceForm.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Base Fee (₱) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editServiceForm.data.base_fee}
                                        required
                                        onChange={(e) =>
                                            editServiceForm.setData(
                                                'base_fee',
                                                Number(e.target.value),
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditService(null)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editServiceForm.processing}
                                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {editServiceForm.processing
                                        ? 'Saving…'
                                        : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Users tab ──────────────────────────────────────────────── */}
            {tab === 'users' && (
                <div>
                    <div className="mb-4 flex justify-end">
                        <button
                            onClick={() => setShowAddUser((v) => !v)}
                            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                        >
                            <PlusIcon className="h-4 w-4" /> Add Staff Account
                        </button>
                    </div>

                    {showAddUser && (
                        <div className="mb-5 rounded-xl border border-teal-200 bg-white p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-700">
                                    New Staff Account
                                </h3>
                                <button onClick={() => setShowAddUser(false)}>
                                    <XMarkIcon className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    addUserForm.submit(storeUserAction(), {
                                        onSuccess: () => {
                                            addUserForm.reset();
                                            setShowAddUser(false);
                                        },
                                    });
                                }}
                            >
                                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={addUserForm.data.name}
                                            required
                                            onChange={(e) =>
                                                addUserForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className={ic}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Role *
                                        </label>
                                        <select
                                            value={addUserForm.data.role}
                                            onChange={(e) =>
                                                addUserForm.setData(
                                                    'role',
                                                    e.target.value,
                                                )
                                            }
                                            className={ic}
                                        >
                                            {Object.entries(ROLE_LABELS).map(
                                                ([v, l]) => (
                                                    <option key={v} value={v}>
                                                        {l}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={addUserForm.data.email}
                                            required
                                            onChange={(e) =>
                                                addUserForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            className={ic}
                                        />
                                        {addUserForm.errors.email && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {addUserForm.errors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={addUserForm.data.password}
                                            required
                                            minLength={8}
                                            onChange={(e) =>
                                                addUserForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className={ic}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={addUserForm.data.phone}
                                            onChange={(e) =>
                                                addUserForm.setData(
                                                    'phone',
                                                    e.target.value,
                                                )
                                            }
                                            className={ic}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500">
                                            PRC License #
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                addUserForm.data.license_number
                                            }
                                            onChange={(e) =>
                                                addUserForm.setData(
                                                    'license_number',
                                                    e.target.value,
                                                )
                                            }
                                            className={ic}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUser(false)}
                                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addUserForm.processing}
                                        className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        {addUserForm.processing
                                            ? 'Creating…'
                                            : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    {[
                                        'Name',
                                        'Email',
                                        'Role',
                                        'Phone',
                                        'License #',
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
                                {users?.map((u: any) => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                                                    {u.name?.[0]}
                                                </div>
                                                <span className="font-medium text-slate-800">
                                                    {u.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">
                                            {u.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_PILL[u.role] ?? ''}`}
                                            >
                                                {ROLE_LABELS[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {u.phone || '—'}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                            {u.license_number || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => openEditUser(u)}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit user modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700">
                                Edit — {editUser.name}
                            </h3>
                            <button onClick={() => setEditUser(null)}>
                                <XMarkIcon className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                editUserForm.submit(
                                    updateUserAction(editUser.id),
                                    { onSuccess: () => setEditUser(null) },
                                );
                            }}
                        >
                            <div className="mb-4 grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editUserForm.data.name}
                                        required
                                        onChange={(e) =>
                                            editUserForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Role *
                                    </label>
                                    <select
                                        value={editUserForm.data.role}
                                        onChange={(e) =>
                                            editUserForm.setData(
                                                'role',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    >
                                        {Object.entries(ROLE_LABELS).map(
                                            ([v, l]) => (
                                                <option key={v} value={v}>
                                                    {l}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={editUserForm.data.phone}
                                        onChange={(e) =>
                                            editUserForm.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        PRC License #
                                    </label>
                                    <input
                                        type="text"
                                        value={editUserForm.data.license_number}
                                        onChange={(e) =>
                                            editUserForm.setData(
                                                'license_number',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        New Password{' '}
                                        <span className="text-slate-300">
                                            (leave blank to keep)
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        value={editUserForm.data.password}
                                        minLength={8}
                                        onChange={(e) =>
                                            editUserForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditUser(null)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editUserForm.processing}
                                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {editUserForm.processing
                                        ? 'Saving…'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
