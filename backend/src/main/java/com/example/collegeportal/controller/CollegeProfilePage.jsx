import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function CollegeProfilePage() {
  const { authHeaders, showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    city: '',
    state: '',
    coursesOffered: '',
    facilities: '',
    website: '',
    contactPhone: '',
    contactEmail: '',
    establishedYear: '',
    imagePath: '',
    nirf: '',
    accreditation: '',
    type: '',
    avgPackage: '',
    highestPackage: '',
    placementPercentage: '',
    shortName: '',
    logoPath: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:8082/api/college/profile', {
          headers: authHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = {};
          Object.keys(formData).forEach(key => mapped[key] = data[key] || '');
          setFormData(mapped);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8082/api/college/profile', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) showToast('Profile updated successfully', 'success');
      else showToast('Failed to update profile', 'error');
    } catch (err) {
      showToast('Error connecting to server', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '120px 0' }}><h3>Loading your profile...</h3></div>;

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 40px)', paddingBottom: 60, background: 'var(--surface-2)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="card" style={{ padding: 32 }}>
          <h1 className="section-title">Manage College Profile</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Update your college details to be displayed on the platform.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2' }}><h3>General Information</h3></div>
            <label>Short Name <input name="shortName" value={formData.shortName} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} placeholder="e.g. VIT" /></label>
            <label>College Type
              <select name="type" value={formData.type} onChange={handleChange} className="form-select" style={{ marginTop: 8 }}>
                <option value="">Select Type</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Deemed">Deemed</option>
                <option value="Aided">Aided</option>
              </select>
            </label>
            <label>Established Year <input type="number" name="establishedYear" value={formData.establishedYear} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>Accreditation <input name="accreditation" value={formData.accreditation} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} placeholder="e.g. NAAC A++" /></label>
            <label>NIRF Ranking <input type="number" name="nirf" value={formData.nirf} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>Logo URL <input name="logoPath" value={formData.logoPath} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} placeholder="https://..." /></label>
            <label style={{ gridColumn: 'span 2' }}>Cover Image URL <input name="imagePath" value={formData.imagePath} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} placeholder="https://..." /></label>

            <div style={{ gridColumn: 'span 2', marginTop: 10 }}><h3>Location & Contact</h3></div>
            <label>City <input name="city" value={formData.city} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>State <input name="state" value={formData.state} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label style={{ gridColumn: 'span 2' }}>Full Address <input name="location" value={formData.location} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>Contact Email <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>Contact Phone <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>Website URL <input name="website" value={formData.website} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} placeholder="https://..." /></label>

            <div style={{ gridColumn: 'span 2', marginTop: 10 }}><h3>Academics & Placements</h3></div>
            <label style={{ gridColumn: 'span 2' }}>About College <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows={4} style={{ marginTop: 8 }} /></label>
            <label style={{ gridColumn: 'span 2' }}>Courses Offered (Comma separated) <input name="coursesOffered" value={formData.coursesOffered} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} placeholder="B.Tech CSE, MBA..." /></label>
            <label style={{ gridColumn: 'span 2' }}>Facilities (Comma separated) <input name="facilities" value={formData.facilities} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} placeholder="Smart Classrooms, Research Labs..." /></label>
            <label>Avg Package (LPA) <input type="number" step="0.1" name="avgPackage" value={formData.avgPackage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>Highest Package (LPA) <input type="number" step="0.1" name="highestPackage" value={formData.highestPackage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>
            <label>Placement % <input type="number" name="placementPercentage" value={formData.placementPercentage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} /></label>

            <div style={{ gridColumn: 'span 2', marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Saving...' : 'Update College Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}