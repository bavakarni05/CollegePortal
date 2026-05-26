import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';

export default function CollegeDashboardPage() {
  const { user, authHeaders, showToast } = useApp();
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showApps, setShowApps] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    fetchCourses();
  }, []);

  const fetchApplications = async () => {
    const res = await fetch('http://localhost:8082/api/college/applications', { headers: authHeaders() });
    if (res.ok) setApplications(await res.json());
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:8082/api/college/profile', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const cRes = await fetch(`http://localhost:8082/api/college/${data.id}/courses`);
        if (cRes.ok) setCourses(await cRes.json());
      }
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`http://localhost:8082/api/college/applications/${id}/status`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`Application ${status.toLowerCase()}`, 'success');
      fetchApplications();
    }
  };

  const filteredApps = courseFilter 
    ? applications.filter(app => app.courseName === courseFilter)
    : applications;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'var(--surface-2)' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
          <div>
            <div className="section-tag">College Admin</div>
            <h1 className="section-title">Welcome, {user ? user.name.split(' ')[0] : 'Admin'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Update your college profile, courses, seat availability and review applications here.</p>
          </div>
          {/* <Link to="/college-login" className="btn btn-secondary">Switch Account</Link> */}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { title: 'College Profile', desc: 'Edit institution details, courses, facilities and contact information.', action: () => navigate('/college-profile') },
            { title: 'Course Catalog', desc: 'Manage courses, eligibility and fees.', action: () => navigate('/college-courses') },
            { title: 'Applications', desc: 'Review applications and update status.', action: () => setShowApps(true) },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 12 }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              <button onClick={item.action} className="btn btn-primary" style={{ marginTop: 18 }}>
                {item.title === 'College Profile' ? 'Edit Profile' : 'Manage'}
              </button>
            </div>
          ))}
        </div>

        {showApps && (
          <div className="card" style={{ marginTop: 30, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Manage Applications</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                <select 
                  value={courseFilter} 
                  onChange={(e) => setCourseFilter(e.target.value)} 
                  className="form-select" 
                  style={{ width: 200 }}
                >
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <button onClick={() => setShowApps(false)} className="btn btn-ghost">Close</button>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              {filteredApps.length === 0 ? <p>No applications found.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: 12 }}>Student</th>
                      <th style={{ padding: 12 }}>Course</th>
                      <th style={{ padding: 12 }}>10th Mark</th>
                      <th style={{ padding: 12 }}>12th Mark</th>
                      <th style={{ padding: 12 }}>Cutoff</th>
                      <th style={{ padding: 12 }}>Status</th>
                      <th style={{ padding: 12 }}>Documents</th>
                      <th style={{ padding: 12 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid var(--surface-3)' }}>
                        <td style={{ padding: 12 }}>{app.studentName}<br/><small>{app.studentPhone}</small></td>
                        <td style={{ padding: 12 }}>{app.courseName}</td>
                        <td style={{ padding: 12 }}>{app.tenthMark}</td>
                        <td style={{ padding: 12 }}>{app.twelfthMark}</td>
                        <td style={{ padding: 12 }}>{app.cutoffMark}</td>
                        <td style={{ padding: 12 }}><span className={`badge badge-${app.status === 'ACCEPTED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'warning'}`}>{app.status}</span></td>
                        <td style={{ padding: 12 }}>
                          {app.tenthMarksheetPath && <a href={`http://localhost:8082${app.tenthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}><FaDownload /> 10th</a>}
                          {app.twelfthMarksheetPath && <a href={`http://localhost:8082${app.twelfthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}><FaDownload /> 12th</a>}
                          {app.photoPath && <a href={`http://localhost:8082${app.photoPath}`} target="_blank" rel="noopener noreferrer"><FaDownload /> Photo</a>}
                        </td>
                        <td style={{ padding: 12 }}>
                          {app.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => updateStatus(app.id, 'ACCEPTED')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}>Accept</button>
                              <button onClick={() => updateStatus(app.id, 'REJECTED')} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
