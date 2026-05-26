import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CollegeProfilePage() {
  const { user, authHeaders, showToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    shortName: '',
    description: '',
    category: '',
    location: '',
    city: '',
    state: '',
    facilities: '',
    website: '',
    contactPhone: '',
    contactEmail: '',
    establishedYear: new Date().getFullYear(),
    nirf: '',
    accreditation: '',
    type: '',
    avgPackage: '',
    highestPackage: '',
    placementPercentage: '',
    imagePath: '',
    logoPath: '',
    minFee: '',
    maxFee: '',
    topRecruiters: '',
    gallery: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'COLLEGE') {
      navigate('/college-dashboard');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:8082/api/college/profile', {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && data) {
        setProfile(sanitizeProfileData(data));
      } else if (res.status === 404) {
        // New college, use default
        setProfile(prev => ({ ...prev, name: user.collegeName || '' }));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sanitizeProfileData = (data) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === null) sanitized[key] = '';
    });
    return sanitized;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8082/api/college/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Profile updated successfully', 'success');
        if (data.college) {
          setProfile(sanitizeProfileData(data.college));
        }
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px 24px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'var(--surface-2)' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div className="card" style={{ padding: 32 }}>
          <h1 className="section-title" style={{ marginBottom: 8 }}>College Profile</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Update your college information to help students find you</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              <label>
                Full College Name
                <input type="text" name="name" value={profile.name} onChange={handleChange} required className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Short Name (e.g. VIT)
                <input type="text" name="shortName" value={profile.shortName} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>

              <label>
                Category
                <select name="category" value={profile.category} onChange={handleChange} required className="form-select" style={{ marginTop: 8 }}>
                  <option value="">Select Category</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Arts & Science">Arts & Science</option>
                  <option value="Law">Law</option>
                  <option value="Management">Management</option>
                </select>
              </label>

              <label>
                College Type
                <select name="type" value={profile.type} onChange={handleChange} required className="form-select" style={{ marginTop: 8 }}>
                  <option value="">Select Type</option>
                  <option value="Private">Private</option>
                  <option value="Government">Government</option>
                  <option value="Aided">Aided</option>
                  <option value="Deemed">Deemed</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
              <label>
                NIRF Ranking
                <input type="number" name="nirf" min="1" value={profile.nirf} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Accreditation (e.g. NAAC A++)
                <input type="text" name="accreditation" value={profile.accreditation} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Website
                <input type="url" name="website" value={profile.website} onChange={handleChange} className="form-input" placeholder="https://example.com" style={{ marginTop: 8 }} />
              </label>

              <label>
                Established Year
                <input type="number" name="establishedYear" min="1800" max={new Date().getFullYear()} value={profile.establishedYear} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              <label>
                City
                <input type="text" name="city" value={profile.city} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>

              <label>
                State
                <input type="text" name="state" value={profile.state} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>

              <label>
                Location / Address
                <input type="text" name="location" value={profile.location} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              <label>
                Min Annual Fee (₹)
                <input type="number" name="minFee" value={profile.minFee} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Max Annual Fee (₹)
                <input type="number" name="maxFee" value={profile.maxFee} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Avg Package (LPA)
                <input type="number" step="0.1" name="avgPackage" value={profile.avgPackage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Highest Package (LPA)
                <input type="number" step="0.1" name="highestPackage" value={profile.highestPackage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Placement %
                <input type="number" name="placementPercentage" value={profile.placementPercentage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              <label>
                Contact Phone
                <input type="tel" name="contactPhone" value={profile.contactPhone} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
              <label>
                Contact Email
                <input type="email" name="contactEmail" value={profile.contactEmail} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              <label>
                Logo URL
                <input type="text" name="logoPath" value={profile.logoPath} onChange={handleChange} className="form-input" placeholder="https://..." style={{ marginTop: 8 }} />
              </label>
              <label>
                Cover Image URL
                <input type="text" name="imagePath" value={profile.imagePath} onChange={handleChange} className="form-input" placeholder="https://..." style={{ marginTop: 8 }} />
              </label>
            </div>

            <label>
              Description
              <textarea name="description" value={profile.description} onChange={handleChange} className="form-input" placeholder="Tell students about your college..." rows={4} style={{ marginTop: 8 }} />
            </label>

            <label>
              Facilities
              <textarea name="facilities" value={profile.facilities} onChange={handleChange} className="form-input" placeholder="List facilities and amenities" rows={3} style={{ marginTop: 8 }} />
            </label>

            <label>
              Top Recruiters
              <textarea name="topRecruiters" value={profile.topRecruiters} onChange={handleChange} className="form-input" placeholder="Google, Amazon, TCS..." rows={2} style={{ marginTop: 8 }} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Separate with commas.</div>
            </label>

            <label>
              Gallery URLs
              <textarea name="gallery" value={profile.gallery} onChange={handleChange} className="form-input" placeholder="https://image1.jpg, https://image2.jpg..." rows={3} style={{ marginTop: 8 }} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Comma separated image URLs.</div>
            </label>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/college-dashboard')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
