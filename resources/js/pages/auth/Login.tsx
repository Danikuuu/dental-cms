import { useForm, Head } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { store as login } from '@/wayfinder/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';

export default function Login() {
    const { data, setData, submit, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit(login());
    };

    return (
        <>
            <Head title="Login" />
            <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-8 w-8 fill-white"
                            >
                                <path d="M12 2C9.24 2 7 4.24 7 7c0 1.67.78 3.15 2 4.12V20a1 1 0 001 1h4a1 1 0 001-1v-8.88C16.22 10.15 17 8.67 17 7c0-2.76-2.24-5-5-5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            DentalCare
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Clinic Management System
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-8 shadow-xl">
                        <h2 className="mb-6 text-lg font-semibold text-slate-800">
                            Sign in to your account
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    autoFocus
                                    required
                                    placeholder="you@clinic.ph"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                <label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-slate-600"
                                >
                                    Remember me
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        On-premise system — contact your administrator for
                        account access.
                    </p>
                    <p className="mt-6 text-center text-xs text-slate-500">
                        All role emails : admin@clinic.ph, drsantos@clinic.ph,
                        drreyes@clinic.ph, staff@clinic.ph
                    </p>
                    <p className="mt-6 text-center text-xs text-slate-500">
                        Password: password
                    </p>
                </div>
            </div>
        </>
    );
}
