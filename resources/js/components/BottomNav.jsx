import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Map, History, Settings, Users } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bottom-nav">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <Home />
                <span>Home</span>
            </Link>
            <Link to="/checklist" className={`nav-item ${isActive('/checklist') ? 'active' : ''}`}>
                <ClipboardList />
                <span>Checklist</span>
            </Link>
            <Link to="/plan" className={`nav-item ${isActive('/plan') ? 'active' : ''}`}>
                <Map />
                <span>Rencana</span>
            </Link>
            <Link to="/history" className={`nav-item ${isActive('/history') ? 'active' : ''}`}>
                <History />
                <span>Riwayat</span>
            </Link>
            <Link to="/groups" className={`nav-item ${isActive('/groups') ? 'active' : ''}`}>
                <Users />
                <span>Grup</span>
            </Link>
            <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
                <Settings />
                <span>Profil</span>
            </Link>
        </nav>
    );
};

export default BottomNav;
