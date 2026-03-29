import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Leaf, Sun, Moon } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDark]);

    return (
        <div className="container">
            <nav className="navbar animate-fade-in">
                <Link to="/" className="nav-brand">
                    <Leaf color="var(--color-lime)" size={28} />
                    <span>PlantDetector</span>
                </Link>
                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Home
                    </NavLink>
                    <NavLink to="/scan" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Scan
                    </NavLink>
                    <NavLink to="/encyclopedia" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Encyclopedia
                    </NavLink>
                    <NavLink to="/plantopedia" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Plantopedia
                    </NavLink>
                    <NavLink to="/funny" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Fun
                    </NavLink>

                    <button
                        onClick={() => setIsDark(!isDark)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.3s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(128,128,128,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        title="Toggle Dark Mode"
                    >
                        {isDark ? <Sun size={22} /> : <Moon size={22} />}
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
