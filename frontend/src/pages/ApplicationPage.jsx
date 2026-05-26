import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ApplicationPage() {
  const { user, authHeaders } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [quota, setQuota] = useState('');
  const [tenthMarksheet, setTenthMarksheet] = useState(null);
  const [twelfthMarksheet, setTwelfthMarksheet] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState({});
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(`profile_${user?.email}`);
    if (saved) setProfile(JSON.parse(saved));
  }, [user?.email]);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const res = await fetch(`http://localhost:8082/api/college/${collegeId}`);
        if (res.ok) {
          const data = await res.json();
          setCollege(data);
          const cRes = await fetch(`http://localhost:8082/api/college/${collegeId}/courses`);
          if (cRes.ok) {
            setCourses(await cRes.json());
          }
        } else if (res.status === 404) { navigate('/not-found'); }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [collegeId]);

  if (loading) return <div style={{ padding: '140px 24px', textAlign: 'center' }}>Loading...</div>;

  if (!college || !user) { // Ensure user is logged in to apply
    return (
      <div style={{ padding: '140px 24px', minHeight: '100vh', textAlign: 'center' }}>
        <h2>College not found</h2>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('collegeId', college.id);
      formData.append('courseName', course);
      formData.append('quota', quota);
      formData.append('studentName', name || user?.name || 'Guest');
      formData.append('studentEmail', email || user?.email || '');
      formData.append('studentPhone', phone);
      formData.append('tenthMark', profile.tenthMark || 0);
      formData.append('twelfthMark', profile.twelfthMark || 0);
      formData.append('cutoffMark', profile.cutoffMark || 0);
      
      if (tenthMarksheet) formData.append('tenthMarksheet', tenthMarksheet);
      if (twelfthMarksheet) formData.append('twelfthMarksheet', twelfthMarksheet);
      if (photo) formData.append('photo', photo);

      const headers = { ...authHeaders() };
      delete headers['Content-Type'];

      const res = await fetch('http://localhost:8082/api/college/apply', {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        const errorData = await res.json();
        alert(`Application failed: ${errorData.error || 'Please check your inputs'}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Connection error. Please ensure the backend is running.');
    }
  };

  const selectedCourseObj = courses.find(c => c.name === course && c.quota === quota);
  const isWaitingList = selectedCourseObj && selectedCourseObj.seats <= 0;

  return (
    <div style={{ padding: 'calc(var(--nav-height) + 40px) 24px', minHeight: '100vh', background: 'var(--surface-2)' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="section-tag">Apply Now</div>
          <h1 className="section-title">Submit your application to {college.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Fill in your details and choose the course you want to apply for.</p>
        </div>

        {submitted ? (
          <div className="card" style={{ padding: 30, textAlign: 'center' }}>
            <h2>Application Submitted</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '18px 0' }}>Your application has been submitted successfully. The college will review your details and update application status soon.</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>
        ) : (
          <form className="card" style={{ padding: 30 }} onSubmit={submit}>
            <label style={{ display: 'block', marginBottom: 16 }}>
              Full Name (as per records)
              <input value={name || user?.name || ''} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="Enter your full name" required style={{ marginTop: 8 }} />
            </label>

            <label style={{ display: 'block', marginBottom: 16 }}>
              Email
              <input type="email" value={email || user?.email || ''} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="your@email.com" required style={{ marginTop: 8 }} />
            </label>

            <label style={{ display: 'block', marginBottom: 16 }}>
              Phone Number
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" placeholder="+91 98765 43210" style={{ marginTop: 8 }} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>10th Marksheet <input type="file" onChange={e => setTenthMarksheet(e.target.files[0])} className="form-input" style={{ marginTop: 8 }} /></label>
              <label>12th Marksheet <input type="file" onChange={e => setTwelfthMarksheet(e.target.files[0])} className="form-input" style={{ marginTop: 8 }} /></label>
            </div>
            <label style={{ display: 'block', marginBottom: 16 }}>
              Passport Size Photo
              <input type="file" onChange={e => setPhoto(e.target.files[0])} className="form-input" style={{ marginTop: 8 }} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>
                Course
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="form-select" required style={{ marginTop: 8 }}>
                  <option value="">Select a course</option>
                  {[...new Set(courses.filter(c => c.quota === 'Management Quota').map(c => c.name))].map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>

              <label>
                Quota
                <select value={quota} onChange={(e) => setQuota(e.target.value)} className="form-select" required style={{ marginTop: 8 }} disabled={!course}>
                  <option value="">Select Quota</option>
                  {courses.filter(c => c.name === course && c.quota === 'Management Quota').map(c => (
                    <option key={c.id} value={c.quota}>
                      {c.quota} {c.seats <= 0 ? '(Waiting List)' : `(${c.seats} left)`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={!course || !quota}>
              {isWaitingList ? 'Join Waiting List' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
