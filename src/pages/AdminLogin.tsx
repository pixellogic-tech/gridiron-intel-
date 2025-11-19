
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Check } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isVerified) {
            setError("Please verify you are not a robot.");
            return;
        }

        // Hardcoded credentials as per user request
        if (email === 'gridiron-intel2025@protonmail.com' && password === 'Trent123$') {
            navigate('/admin');
        } else {
            setError('Invalid admin credentials.');
        }
    };
    
    const inputStyles = "w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary";
    const buttonStyles = "w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition disabled:bg-slate-600 disabled:cursor-not-allowed";

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
             <div className="absolute inset-0 bg-grid-slate-900/[0.2]"></div>
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            
            <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-red-800/50">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-4 text-3xl font-bold text-white">
                        🏈 Gridiron Intel
                    </Link>
                    <div className="flex items-center justify-center gap-2">
                        <Shield className="text-red-500"/>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                    </div>
                    <p className="text-slate-400">Restricted Access</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-400 text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Admin Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputStyles} placeholder="gridiron-intel2025@protonmail.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputStyles} placeholder="••••••••" />
                    </div>

                    <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg border border-slate-600">
                        <div 
                            onClick={() => setIsVerified(!isVerified)} 
                            className={`w-6 h-6 rounded border-2 ${isVerified ? 'bg-brand-primary border-brand-primary' : 'border-slate-500'} cursor-pointer flex items-center justify-center transition-colors`}
                        >
                            {isVerified && <Check size={16} />}
                        </div>
                        <label htmlFor="captcha" className="text-slate-300">I am not a robot</label>
                    </div>

                    <button type="submit" className={buttonStyles} disabled={!isVerified}>
                        Secure Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;