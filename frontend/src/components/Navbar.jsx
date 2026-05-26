import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, logout, wishlist, compareList } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: 'var(--nav-height)',
      background: scrolled || !isHome ? '#FFF0F5' : 'transparent',
      backdropFilter: scrolled || !isHome ? 'blur(12px)' : 'none',
      borderBottom: scrolled || !isHome ? '1px solid var(--border)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', maxWidth: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            🎓
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, color: isHome && !scrolled ? 'white' : 'var(--primary)' }}>
              EduConnect
            </div>
            <div style={{ fontSize: 10, letterSpacing: 0.15, color: isHome && !scrolled ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>
              College Admission Portal
            </div>
          </div>
        </Link>

        <nav className="desktop-nav" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? ( // If user is logged in
            user.role === 'STUDENT' ? (
              // Student menu
              [
                { label: 'Search Colleges', to: '/search' },
                { label: 'Recommendations', to: '/search?recommend=true' },
                { label: 'My Applications', to: '/dashboard?view=apps' },
                { label: 'Compare', to: '/compare', badge: compareList.length }, 
                { label: 'Wishlist', to: '/wishlist', badge: wishlist.length }
              ].map(item => (
                <Link key={item.to} to={item.to} className={`btn ${location.pathname + location.search === item.to ? 'btn-secondary' : 'btn-ghost'}`} style={{
                  padding: '8px 14px',
                  color: (location.pathname + location.search !== item.to && isHome && !scrolled) ? 'white' : undefined
                }}>
                  {item.label}
                  {item.badge ? <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: 'white', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>{item.badge}</span> : null}
                </Link>
              ))
            ) : ( // College menu (currently empty, but can be extended)
              null
            )
          ) : ( // No user logged in, no navigation links here
            null
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <button onClick={() => navigate(user.role === 'COLLEGE' ? '/college-dashboard' : '/dashboard')} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
                {user.role === 'COLLEGE' ? 'Admin' : ' '} {user.name.split('  ')[0]}
              </button>
              <button onClick={logout} className="btn btn-ghost" style={{ padding: '8px 14px' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/?login=true" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                Register
              </Link>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: 'none', border: 'none', background: 'transparent', fontSize: 22, color: isHome && !scrolled ? 'white' : 'var(--text-primary)' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: 16 }}>
          {user && user.role === 'STUDENT' ? (
            [
              { label: 'Search Colleges', to: '/search' },
              { label: 'My Applications', to: '/dashboard?view=apps' },
              { label: 'Compare', to: '/compare' },
              { label: 'Wishlist', to: '/wishlist' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{ display: 'block', padding: '10px 0', color: 'var(--text-primary)' }}>{item.label}</Link>
            ))
          ) : (
            <Link to="/" style={{ display: 'block', padding: '10px 0', color: 'var(--text-primary)' }}>Register</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: block; }
        }
      `}</style>
    </header>
  );
}
