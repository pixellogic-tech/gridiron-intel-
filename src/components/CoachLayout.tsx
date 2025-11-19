import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Dumbbell, BookCopy, Users, BrainCircuit, LogOut, Settings } from 'lucide-react';
import { TeamContext } from '../App';
import { SettingsContext } from '../App';

const CoachLayout: React.FC = () => {
    const { teamProfile } = useContext(TeamContext);
    const { openSettings } = useContext(SettingsContext);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Game Time', path: '/game-time', icon: Zap },
        { name: 'Practice', path: '/practice', icon: Dumbbell },
        { name: 'Playbook', path: '/playbook', icon: BookCopy },
        { name: 'Roster', path: '/roster', icon: Users },
        { name: 'AI Training', path: '/training', icon: BrainCircuit },
    ];
    
    const activeLinkStyle = {
      backgroundColor: teamProfile.primaryColor,
      color: 'white',
    };

    const BottomNavItem = ({ item, isActive }: { item: typeof navItems[0], isActive: boolean }) => (
        <NavLink
            to={item.path}
            className={`flex flex-col items-center justify-center text-xs gap-1 transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-400 hover:text-white'}`}
        >
            <item.icon size={22} />
            <span>{item.name}</span>
        </NavLink>
    );

    return (
        <div className="flex h-screen bg-slate-900 text-white">
            {/* Sidebar for Desktop */}
            <aside className="w-64 flex-shrink-0 bg-slate-800 flex-col border-r border-slate-700 hidden md:flex">
                <div className="h-16 flex items-center justify-center px-4 border-b border-slate-700">
                    <h1 className="text-xl font-bold">🏈 Gridiron Intel</h1>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-slate-700"
                            style={({ isActive }) => (isActive ? activeLinkStyle : {})}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={openSettings} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-slate-700">
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-slate-400 hover:bg-red-500/20 hover:text-white mt-2">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    <Outlet />
                </div>
            </main>
            
            {/* Bottom Navigation for Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-800 border-t border-slate-700 grid grid-cols-4 z-50">
                <BottomNavItem item={navItems[0]} isActive={location.pathname === navItems[0].path} />
                <BottomNavItem item={navItems[1]} isActive={location.pathname === navItems[1].path} />
                <BottomNavItem item={navItems[2]} isActive={location.pathname === navItems[2].path} />
                <BottomNavItem item={navItems[4]} isActive={location.pathname === navItems[4].path} />
                 {/* Note: More than 4-5 items is not ideal for bottom nav. Some are excluded for brevity on mobile. */}
            </div>
        </div>
    );
};

export default CoachLayout;
