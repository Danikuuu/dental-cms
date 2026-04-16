import { useForm, Head } from '@inertiajs/react';
import { FormEvent } from 'react';
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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mb-4">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                                <path d="M12 2C9.24 2 7 4.24 7 7c0 1.67.78 3.15 2 4.12V20a1 1 0 001 1h4a1 1 0 001-1v-8.88C16.22 10.15 17 8.67 17 7c0-2.76-2.24-5-5-5z"/>
                            </svg>
                        </div>
                        <h1 className="text-white text-2xl font-bold">DentalCare</h1>
                        <p className="text-slate-400 text-sm mt-1">Clinic Management System</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <h2 className="text-slate-800 text-lg font-semibold mb-6">Sign in to your account</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Email address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    autoFocus
                                    required
                                    placeholder="you@clinic.ph"
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Remember me</label>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-slate-500 text-xs mt-6">
                        On-premise system — contact your administrator for account access.
                    </p>
                    <p className="text-center text-slate-500 text-xs mt-6">All role emails : admin@clinic.ph, drsantos@clinic.ph, drreyes@clinic.ph, staff@clinic.ph</p>
                    <p className="text-center text-slate-500 text-xs mt-6">Password: password</p>
                </div>
            </div>
        </>
    );
}
