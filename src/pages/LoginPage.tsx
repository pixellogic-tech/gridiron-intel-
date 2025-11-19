
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'coach' | 'player'>('coach');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login logic
        if (activeTab === 'coach') {
            navigate('/dashboard');
        } else {
            navigate('/player-dashboard');
        }
    };
    
    const inputStyles = "w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary";
    const buttonStyles = "w-full py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-lg font-bold transition";

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
             <div className="absolute inset-0 bg-grid-slate-900/[0.2]"></div>
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            
            <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-4 text-3xl font-bold text-white">
                        🏈 Gridiron Intel
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to access your dashboard.</p>
                </div>
                
                <div className="flex p-1 bg-slate-800 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('coach')}
                        className={`w-1/2 p-2 rounded-md font-semibold transition ${activeTab === 'coach' ? 'bg-brand-primary text-white' : 'text-slate-400'}`}
                    >
                        Coach Login
                    </button>
                    <button
                         onClick={() => setActiveTab('player')}
                         className={`w-1/2 p-2 rounded-md font-semibold transition ${activeTab === 'player' ? 'bg-brand-primary text-white' : 'text-slate-400'}`}
                    >
                        Player Login
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email or Username</label>
                        <input type="text" required className={inputStyles} placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                        <input type="password" required className={inputStyles} placeholder="••••••••" />
                    </div>
                    <button type="submit" className={buttonStyles}>
                        Sign In as {activeTab === 'coach' ? 'Coach' : 'Player'}
                    </button>
                </form>
                
                <div className="text-center text-slate-400 text-sm">
                    <p>To get an account, please contact your program administrator.</p>
                    <Link to="/admin/login" className="hover:text-brand-accent transition text-xs">Admin Login</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;