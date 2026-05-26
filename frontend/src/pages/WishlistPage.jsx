import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const { wishlist } = useApp();

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'var(--surface-2)' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <div className="section-tag">Wishlist</div>
          <h1 className="section-title">Your saved colleges</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bookmark colleges to compare and apply later.</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>No colleges have been saved yet.</p>
            <Link to="/search" className="btn btn-primary">Browse Colleges</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {wishlist.map(college => (
              <div key={college.id} className="card" style={{ padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                <div>
                  <h3 style={{ marginBottom: 6 }}>{college.name}</h3>
                  <div style={{ color: 'var(--text-secondary)' }}>{college.city}, {college.state}</div>
                </div>
                <Link to={`/college/${college.id}`} className="btn btn-secondary">View</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
