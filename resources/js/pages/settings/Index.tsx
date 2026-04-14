import {
    updateClinic as updateClinicAction,
    storeUser as storeUserAction,
    updateUser as updateUserAction,
} from '@/wayfinder/actions/App/Http/Controllers/SettingsController';
import {
    store as storeService,
    update as updateService,
    destroy as destroyService,
} from '@/wayfinder/actions/App/Http/Controllers/ServiceController';
import AppLayout from '@/layouts/AppLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number | string) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin', dentist: 'Dentist', staff: 'Staff', receptionist: 'Receptionist',
};
const ROLE_PILL: Record<string, string> = {
    admin:        'bg-purple-100 text-purple-800',
    dentist:      'bg-teal-100 text-teal-800',
    staff:        'bg-blue-100 text-blue-700',
    receptionist: 'bg-slate-100 text-slate-600',
};

export default function SettingsIndex({ clinic, services, users }: any) {
    const [tab, setTab]           = useState<'clinic'|'services'|'users'>('clinic');
    const [editService, setEditService] = useState<any>(null);
    const [editUser,    setEditUser]    = useState<any>(null);
    const [showAddUser, setShowAddUser] = useState(false);

    // ── Clinic settings form ──────────────────────────────────────────────
    const clinicForm = useForm({
        clinic_name:    clinic?.clinic_name ?? '',
        clinic_address: clinic?.clinic_address ?? '',
        clinic_phone:   clinic?.clinic_phone ?? '',
        clinic_email:   clinic?.clinic_email ?? '',
        clinic_tin:     clinic?.clinic_tin ?? '',
        vat_registered: clinic?.vat_registered === 'true' || clinic?.vat_registered === '1',
        vat_percent:    clinic?.vat_percent ?? 12,
        receipt_footer: clinic?.receipt_footer ?? '',
    });

    // ── Service forms ─────────────────────────────────────────────────────
    const serviceForm = useForm({
        name: '', category: '', base_fee: 0, description: '', code: '', is_vat_inclusive: false,
    });
    const editServiceForm = useForm({
        name: '', category: '', base_fee: 0, description: '', code: '', is_vat_inclusive: false, is_active: true,
    });

    const openEditService = (s: any) => {
        setEditService(s);
        editServiceForm.setData({
            name: s.name, category: s.category, base_fee: Number(s.base_fee),
            description: s.description ?? '', code: s.code ?? '',
            is_vat_inclusive: s.is_vat_inclusive, is_active: s.is_active,
        });
    };

    // ── User forms ────────────────────────────────────────────────────────
    const addUserForm = useForm({
        name: '', email: '', password: '', role: 'staff', phone: '', license_number: '',
    });
    const editUserForm = useForm({
        name: '', role: 'staff', phone: '', license_number: '', password: '',
    });

    const openEditUser = (u: any) => {
        setEditUser(u);
        editUserForm.setData({ name: u.name, role: u.role, phone: u.phone ?? '', license_number: u.license_number ?? '', password: '' });
    };

    // Group services by category
    const grouped = (services ?? []).reduce((acc: any, s: any) => {
        (acc[s.category] ??= []).push(s); return acc;
    }, {} as Record<string, any[]>);

    return (
        <AppLayout title="Settings">
            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-5">
                {(['clinic','services','users'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize
                            ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Clinic tab ─────────────────────────────────────────────── */}
            {tab === 'clinic' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
                    <h3 className="font-semibold text-slate-700 mb-5">Clinic Information</h3>
                    <form onSubmit={e => { e.preventDefault(); clinicForm.submit(updateClinicAction(), { onSuccess: () => {} }); }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Clinic Name *</label>
                                <input type="text" value={clinicForm.data.clinic_name} required onChange={e => clinicForm.setData('clinic_name', e.target.value)} className={ic} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Address</label>
                                <input type="text" value={clinicForm.data.clinic_address} onChange={e => clinicForm.setData('clinic_address', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                                <input type="text" value={clinicForm.data.clinic_phone} onChange={e => clinicForm.setData('clinic_phone', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Email</label>
                                <input type="email" value={clinicForm.data.clinic_email} onChange={e => clinicForm.setData('clinic_email', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">TIN</label>
                                <input type="text" value={clinicForm.data.clinic_tin} onChange={e => clinicForm.setData('clinic_tin', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">VAT %</label>
                                <input type="number" min="0" max="100" step="0.01" value={clinicForm.data.vat_percent} onChange={e => clinicForm.setData('vat_percent', Number(e.target.value))} className={ic} />
                            </div>
                            <div className="col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer mb-3">
                                    <input type="checkbox" checked={clinicForm.data.vat_registered}
                                        onChange={e => clinicForm.setData('vat_registered', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                    <span className="text-sm text-slate-700">VAT Registered</span>
                                </label>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Receipt Footer</label>
                                <textarea rows={3} value={clinicForm.data.receipt_footer} onChange={e => clinicForm.setData('receipt_footer', e.target.value)} className={ic + ' resize-none'} placeholder="Thank you for choosing us!" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={clinicForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                                {clinicForm.processing ? 'Saving…' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Services tab ───────────────────────────────────────────── */}
            {tab === 'services' && (
                <div>
                    {/* Add service */}
                    <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5">
                        <h3 className="font-semibold text-slate-700 mb-4">Add Service</h3>
                        <form onSubmit={e => { e.preventDefault(); serviceForm.submit(storeService(), { onSuccess: () => serviceForm.reset() }); }}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Service Name *</label>
                                    <input type="text" value={serviceForm.data.name} required onChange={e => serviceForm.setData('name', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Category *</label>
                                    <input type="text" value={serviceForm.data.category} required onChange={e => serviceForm.setData('category', e.target.value)} className={ic} placeholder="e.g. Restorative" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Base Fee (₱) *</label>
                                    <input type="number" min="0" step="0.01" value={serviceForm.data.base_fee} required onChange={e => serviceForm.setData('base_fee', Number(e.target.value))} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Code</label>
                                    <input type="text" value={serviceForm.data.code} onChange={e => serviceForm.setData('code', e.target.value)} className={ic} placeholder="e.g. D1110" />
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs text-slate-500 mb-1 block">Description</label>
                                    <input type="text" value={serviceForm.data.description} onChange={e => serviceForm.setData('description', e.target.value)} className={ic} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={serviceForm.data.is_vat_inclusive}
                                        onChange={e => serviceForm.setData('is_vat_inclusive', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600" />
                                    <span className="text-sm text-slate-600">VAT Inclusive</span>
                                </label>
                                <button type="submit" disabled={serviceForm.processing} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    <PlusIcon className="w-4 h-4" /> {serviceForm.processing ? 'Adding…' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Service catalog */}
                    {Object.entries(grouped).map(([category, svcs]: [string, any]) => (
                        <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-700 text-sm">{category}</h3>
                            </div>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-slate-100">
                                    {svcs.map((s: any) => (
                                        <tr key={s.id} className={`hover:bg-slate-50 ${!s.is_active ? 'opacity-40' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">{s.name}</div>
                                                {s.code && <div className="text-xs text-slate-400 font-mono">{s.code}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{s.description}</td>
                                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{fmt(s.base_fee)}</td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{s.is_vat_inclusive ? 'VAT incl.' : ''}</td>
                                            <td className="px-4 py-3">
                                                {!s.is_active ? (
                                                    <span className="text-xs text-slate-400">Inactive</span>
                                                ) : (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openEditService(s)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded">
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => router.delete(destroyService(s.id).url, { preserveState: false })}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit service modal */}
            {editService && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700">Edit Service</h3>
                            <button onClick={() => setEditService(null)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={e => {
                            e.preventDefault();
                            editServiceForm.submit(updateService(editService.id), { onSuccess: () => setEditService(null) });
                        }}>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Name *</label>
                                    <input type="text" value={editServiceForm.data.name} required onChange={e => editServiceForm.setData('name', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Category *</label>
                                    <input type="text" value={editServiceForm.data.category} required onChange={e => editServiceForm.setData('category', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Base Fee (₱) *</label>
                                    <input type="number" min="0" step="0.01" value={editServiceForm.data.base_fee} required onChange={e => editServiceForm.setData('base_fee', Number(e.target.value))} className={ic} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setEditService(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                <button type="submit" disabled={editServiceForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    {editServiceForm.processing ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Users tab ──────────────────────────────────────────────── */}
            {tab === 'users' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setShowAddUser(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                            <PlusIcon className="w-4 h-4" /> Add Staff Account
                        </button>
                    </div>

                    {showAddUser && (
                        <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-700">New Staff Account</h3>
                                <button onClick={() => setShowAddUser(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <form onSubmit={e => { e.preventDefault(); addUserForm.submit(storeUserAction(), { onSuccess: () => { addUserForm.reset(); setShowAddUser(false); } }); }}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-500 mb-1 block">Full Name *</label>
                                        <input type="text" value={addUserForm.data.name} required onChange={e => addUserForm.setData('name', e.target.value)} className={ic} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Role *</label>
                                        <select value={addUserForm.data.role} onChange={e => addUserForm.setData('role', e.target.value)} className={ic}>
                                            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-500 mb-1 block">Email *</label>
                                        <input type="email" value={addUserForm.data.email} required onChange={e => addUserForm.setData('email', e.target.value)} className={ic} />
                                        {addUserForm.errors.email && <p className="text-red-500 text-xs mt-1">{addUserForm.errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Password *</label>
                                        <input type="password" value={addUserForm.data.password} required minLength={8} onChange={e => addUserForm.setData('password', e.target.value)} className={ic} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                                        <input type="tel" value={addUserForm.data.phone} onChange={e => addUserForm.setData('phone', e.target.value)} className={ic} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">PRC License #</label>
                                        <input type="text" value={addUserForm.data.license_number} onChange={e => addUserForm.setData('license_number', e.target.value)} className={ic} />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                    <button type="submit" disabled={addUserForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                        {addUserForm.processing ? 'Creating…' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Name','Email','Role','Phone','License #',''].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users?.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold flex-shrink-0">
                                                    {u.name?.[0]}
                                                </div>
                                                <span className="font-medium text-slate-800">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-sm">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_PILL[u.role] ?? ''}`}>
                                                {ROLE_LABELS[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{u.phone || '—'}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs font-mono">{u.license_number || '—'}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => openEditUser(u)}
                                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                                                <PencilIcon className="w-4 h-4" />
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
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700">Edit — {editUser.name}</h3>
                            <button onClick={() => setEditUser(null)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={e => {
                            e.preventDefault();
                            editUserForm.submit(updateUserAction(editUser.id), { onSuccess: () => setEditUser(null) });
                        }}>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Name *</label>
                                    <input type="text" value={editUserForm.data.name} required onChange={e => editUserForm.setData('name', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Role *</label>
                                    <select value={editUserForm.data.role} onChange={e => editUserForm.setData('role', e.target.value)} className={ic}>
                                        {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                                    <input type="tel" value={editUserForm.data.phone} onChange={e => editUserForm.setData('phone', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">PRC License #</label>
                                    <input type="text" value={editUserForm.data.license_number} onChange={e => editUserForm.setData('license_number', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">New Password <span className="text-slate-300">(leave blank to keep)</span></label>
                                    <input type="password" value={editUserForm.data.password} minLength={8} onChange={e => editUserForm.setData('password', e.target.value)} className={ic} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                <button type="submit" disabled={editUserForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    {editUserForm.processing ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
