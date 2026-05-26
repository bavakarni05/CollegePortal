import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaDownload } from 'react-icons/fa';

export default function StudentDashboardPage() {
  const { user, wishlist, toggleWishlist, showToast, isWishlisted, authHeaders } = useApp();
  const [profileData, setProfileData] = useState({
    wishedPlace: '',
    cutoffMark: '',
    twelfthMark: '',
    tenthMark: '',
    maxFee: ''
  });
  const [applications, setApplications] = useState([]);
  const [showApps, setShowApps] = useState(false);
  const location = useLocation();

  const fetchMyApplications = useCallback(async () => {
    if (!user) return;
    const res = await fetch('http://localhost:8082/api/college/my-applications', { headers: authHeaders() });
    if (res.ok) setApplications(await res.json());
  }, [authHeaders, user]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setShowApps(query.get('view') === 'apps');

    const saved = localStorage.getItem(`profile_${user?.email}`);
    if (saved) setProfileData(JSON.parse(saved));
    fetchMyApplications();
  }, [user, location.search, fetchMyApplications]);

  const cancelApplication = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;
    try {
      const res = await fetch(`http://localhost:8082/api/college/applications/${id}/status`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (res.ok) {
        showToast('Application cancelled', 'default');
        fetchMyApplications();
      } else {
        showToast('Failed to cancel application', 'error');
      }
    } catch (err) {
      showToast('Error connecting to server', 'error');
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(`profile_${user?.email}`, JSON.stringify(profileData));
    showToast('Academic profile updated', 'success');
  };

  const stats = {
    Submitted: applications.length,
    'Under Review': applications.filter(a => a.status === 'PENDING').length,
    Accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    Rejected: applications.filter(a => a.status === 'REJECTED').length
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: '#f4f7fe' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <div className="section-tag">Dashboard</div>
            <h1 className="section-title">Welcome back, {user ? user.name.split(' ')[0] : 'Student'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>View your saved colleges, application history, and admission updates.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showApps ? '1fr' : '1fr 320px', gap: 24 }}>
          <div>
            {showApps ? (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2>My Applications</h2>
                  <button onClick={() => setShowApps(false)} className="btn btn-ghost">← Back to Dashboard</button>
                </div>

                <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  {Object.keys(stats).map(status => (
                    <div key={status} style={{ padding: 12, borderRadius: 12, background: 'var(--surface-3)', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{status}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>{stats[status]}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {applications.length === 0 ? (
                    <p style={{ padding: '20px 0', color: 'var(--text-secondary)' }}>You haven't applied to any colleges yet.</p>
                  ) : (
                    applications.map(app => (
                      <div key={app.id} style={{ padding: 16, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{app.collegeName}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Course: {app.courseName} (Cutoff: {app.cutoffMark})</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                          Documents:
                          {app.tenthMarksheetPath && <a href={`http://localhost:8082${app.tenthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}><FaDownload /> 10th</a>}
                          {app.twelfthMarksheetPath && <a href={`http://localhost:8082${app.twelfthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}><FaDownload /> 12th</a>}
                          {app.photoPath && <a href={`http://localhost:8082${app.photoPath}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}><FaDownload /> Photo</a>}
                        </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className={`badge badge-${app.status === 'ACCEPTED' ? 'success' : (app.status === 'REJECTED' || app.status === 'CANCELLED') ? 'error' : 'warning'}`}>
                            {app.status}
                          </span>
                          {app.status !== 'CANCELLED' && app.status !== 'REJECTED' && (
                            <button onClick={() => cancelApplication(app.id)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: 'var(--error)', border: '1px solid var(--border)' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="card" style={{ padding: 24 }}>
                  <h2>Academic Profile</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 18 }}>Used to provide personalized college recommendations.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label style={{ fontSize: 14 }}>Wished Place to Study
                      <input className="form-input" value={profileData.wishedPlace} onChange={e => setProfileData({...profileData, wishedPlace: e.target.value})} placeholder="e.g. Chennai" style={{ marginTop: 6 }} />
                    </label>
                    <label style={{ fontSize: 14 }}>Entrance Cutoff Mark
                      <input type="number" className="form-input" value={profileData.cutoffMark} onChange={e => setProfileData({...profileData, cutoffMark: e.target.value})} placeholder="0.00" style={{ marginTop: 6 }} />
                    </label>
                    <label style={{ fontSize: 14 }}>12th Percentage
                      <input type="number" className="form-input" value={profileData.twelfthMark} onChange={e => setProfileData({...profileData, twelfthMark: e.target.value})} placeholder="%" style={{ marginTop: 6 }} />
                    </label>
                    <label style={{ fontSize: 14 }}>10th Percentage
                      <input type="number" className="form-input" value={profileData.tenthMark} onChange={e => setProfileData({...profileData, tenthMark: e.target.value})} placeholder="%" style={{ marginTop: 6 }} />
                    </label>
                    <label style={{ fontSize: 14 }}>Maximum Budget (Annual Fee)
                      <input type="number" className="form-input" value={profileData.maxFee} onChange={e => setProfileData({...profileData, maxFee: e.target.value})} placeholder="₹ e.g. 150000" style={{ marginTop: 6 }} />
                    </label>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button onClick={handleSaveProfile} className="btn btn-primary" style={{ padding: '8px 20px' }}>Update Profile</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!showApps && (
            <aside>
              <h3>Saved colleges</h3>
              {wishlist.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', marginTop: 14 }}>You don’t have any favorites yet. Save colleges while browsing to quickly compare them later.</p>
              ) : (
                <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                  {wishlist.map(item => (
                    <div key={item.id} style={{ padding: 14, borderRadius: 14, background: 'var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.city}</div>
                      </div>
                      <button onClick={() => toggleWishlist(item)} style={{ border: 'none', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontSize: 18 }}>❤️</button>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
