import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function CourseCatalogPage() {
  const { user, authHeaders, showToast } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState(null);
  const navigate = useNavigate();

  const [newCourse, setNewCourse] = useState({
    name: '', 
    seats: '', 
    totalSeats: '', 
    cutoff: '', 
    eligibility: '', 
    fees: '', 
    quota: 'Government Quota',
    cutoffOC: '', cutoffBC: '', cutoffMBC: '', cutoffSCST: '', cutoffBCM: ''
  });

  useEffect(() => {
    const init = async () => {
      const res = await fetch('http://localhost:8082/api/college/profile', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCollegeId(data.id);
        fetchCourses(data.id);
      }
    };
    init();
  }, []);

  const fetchCourses = async (id) => {
    const res = await fetch(`http://localhost:8082/api/college/${id}/courses`);
    if (res.ok) setCourses(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8082/api/college/courses', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCourse, collegeId })
    });
    if (res.ok) {
      showToast('Course added', 'success');
      setNewCourse({ 
        name: '', seats: '', totalSeats: '', cutoff: '', eligibility: '', fees: '', quota: 'Government Quota',
        cutoffOC: '', cutoffBC: '', cutoffMBC: '', cutoffSCST: '', cutoffBCM: ''
      });
      fetchCourses(collegeId);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`http://localhost:8082/api/college/courses/delete/${id}`, { method: 'POST' });
    if (res.ok) {
      showToast('Course removed');
      fetchCourses(collegeId);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: 'calc(var(--nav-height) + 40px) 24px', background: 'var(--surface-2)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div style={{ marginBottom: 24 }}>
            <button onClick={() => navigate('/college-dashboard')} className="btn btn-ghost" style={{ marginBottom: 12 }}>← Back to Dashboard</button>
            <h1 className="section-title">Course Catalog</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your available courses, seats, and entrance cutoffs.</p>
        </div>

        <form className="card" style={{ padding: 24, marginBottom: 30 }} onSubmit={handleAdd}>
          <h3>Add New Course</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 18 }}>
            <label>Course Name
              <select className="form-select" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} required>
                <option value="">Select Dept</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </label>
            <label>Quota
              <select className="form-select" value={newCourse.quota} onChange={e => setNewCourse({...newCourse, quota: e.target.value})} required>
                <option value="Government Quota">Government Quota</option>
                <option value="Management Quota">Management Quota</option>
                <option value="Sports Quota">Sports Quota</option>
              </select>
            </label>
            {newCourse.quota === 'Government Quota' && (
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: 16, background: 'var(--surface-3)', borderRadius: 12 }}>
                <div style={{ fontWeight: 600, gridColumn: '1 / -1', marginBottom: 8 }}>Government Quota - Community Cutoff Marks</div>
                {['OC', 'BC', 'MBC', 'SCST', 'BCM'].map(cat => (
                  <div key={cat} style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{cat}</div>
                    <input type="number" step="0.01" placeholder="Cutoff Mark" className="form-input" style={{ fontSize: 12 }} 
                      value={newCourse[`cutoff${cat}`]} onChange={e => setNewCourse({...newCourse, [`cutoff${cat}`]: e.target.value})} />
                  </div>
                ))}
              </div>
            )}
            <label>Total Seats <input type="number" className="form-input" value={newCourse.totalSeats} onChange={e => {
              const val = e.target.value;
              setNewCourse({...newCourse, totalSeats: val, seats: val});
            }} required /></label>
            <label>Available Seats <input type="number" className="form-input" value={newCourse.seats} onChange={e => setNewCourse({...newCourse, seats: e.target.value})} required /></label>
            <label>Entrance Cutoff <input type="number" step="0.1" className="form-input" value={newCourse.cutoff} onChange={e => setNewCourse({...newCourse, cutoff: e.target.value})} required /></label>
            <label>Eligibility <input className="form-input" value={newCourse.eligibility} onChange={e => setNewCourse({...newCourse, eligibility: e.target.value})} required /></label>
            <label>Fees (Annual) <input type="number" className="form-input" value={newCourse.fees} onChange={e => setNewCourse({...newCourse, fees: e.target.value})} required /></label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }}>Add Course</button>
        </form>

        <div className="grid-2">
          {courses.map(course => (
            <div key={course.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{course.name}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Eligibility: {course.eligibility}</div>
                </div>
                <button onClick={() => handleDelete(course.id)} className="btn btn-ghost" style={{ color: 'var(--error)' }}>Delete</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <div style={{ padding: 10, background: 'var(--surface-3)', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{course.seats}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Seats</div>
                </div>
                <div style={{ padding: 10, background: 'var(--surface-3)', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{course.cutoff}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cutoff</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontWeight: 600, textAlign: 'center' }}>
                ₹{course.fees?.toLocaleString()} / year
              </div>
            </div>
          ))}
        </div>
        
        {courses.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No courses added to the catalog yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}