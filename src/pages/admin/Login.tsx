import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { currentUser, isAdmin, loading } = useAuth();

    useEffect(() => {
        if (!loading && currentUser && isAdmin) {
            navigate('/admin/dashboard');
        }
    }, [currentUser, isAdmin, loading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            const user = data.user;
            if (!user) throw new Error('Login failed.');

            // Check admin status
            const { data: adminRow } = await supabase
                .from('admin_users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!adminRow) {
                // Try to claim initial admin if no admins exist yet
                const { count } = await supabase
                    .from('admin_users')
                    .select('id', { count: 'exact', head: true });

                if (count === 0) {
                    await supabase.from('admin_users').insert({
                        id: user.id,
                        email: user.email,
                        bootstrap: true,
                    });
                } else {
                    await supabase.auth.signOut();
                    throw new Error('This account is not authorized for admin access.');
                }
            }

            // Let the useEffect handle the navigation once the AuthContext properly registers the login state!
        } catch (err: any) {
            const message = err?.message || 'Invalid credentials';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-900 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500 opacity-20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 opacity-20 blur-[120px] rounded-full"></div>
                <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] bg-gold-400 opacity-10 blur-[80px] rounded-full"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 mx-4">
                <div className="text-center mb-8">
                    <img 
                        src="/logo.jpeg" 
                        alt="Al-Ihsan Logo" 
                        className="w-20 h-20 rounded-full border-4 border-gold-500 shadow-xl mx-auto mb-6 object-cover"
                    />
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Admin Identity</h1>
                    <p className="text-gray-300 text-sm">Secure access to Al-Ihsan Control Panel</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-center mb-6 p-3 rounded-xl text-sm backdrop-blur-sm flex items-center gap-2 justify-center">
                        <Lock size={16} className="text-red-400" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 ml-1">Administrator Email</label>
                        <input
                            type="email"
                            placeholder="admin@alihsan.org"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="new-password"
                            name="admin-email-field"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none text-white placeholder-gray-500 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 ml-1">Secure Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                name="admin-password-field"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none pr-14 text-white placeholder-gray-500 transition-all font-light tracking-widest"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-primary-900 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Lock size={20} />
                            )}
                            {isLoading ? 'Authenticating...' : 'Authenticate'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Al-Ihsan Relief & Empowerment.<br/>
                        For internal administrative use only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
