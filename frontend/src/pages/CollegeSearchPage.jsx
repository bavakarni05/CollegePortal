import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CollegeSearchPage() {
  const { user } = useApp();
  const location = useLocation();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    city: '',
    maxNirf: '',
    minPlacement: '',
    maxFee: '',
    maxCutoff: ''
  });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('recommend') === 'true' && user) {
      const saved = localStorage.getItem(`profile_${user.email}`);
      if (saved) {
        const profile = JSON.parse(saved);
        setFilters(prev => ({ 
          ...prev, 
          city: profile.wishedPlace || '', 
          maxCutoff: profile.cutoffMark || '',
          maxFee: profile.maxFee || ''
        }));
      }
    } else {
      // Reset profile-based filters if we are doing a standard search
      setFilters(prev => ({ ...prev, city: '', maxCutoff: '', maxFee: '' }));
    }
    fetchColleges();
  }, [location.search, user]);

  // Fetch whenever filters change (manually)
  useEffect(() => {
    fetchColleges();
  }, [filters]);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => { if (val) params.append(key, val); });
      const res = await fetch(`http://localhost:8082/api/college/list?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setColleges(data);
    } catch (err) {
      console.error('Error searching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ padding: 'calc(var(--nav-height) + 30px) 24px', background: 'var(--surface-2)', minHeight: '100vh' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 30, maxWidth: '100%' }}>
        {/* Sidebar Filters */}
        <aside>
          <div className="card" style={{ padding: 20, position: 'sticky', top: 'calc(var(--nav-height) + 20px)' }}>
            <h3 style={{ marginBottom: 20 }}>Filters</h3>
            
            <div style={{ display: 'grid', gap: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Category
                <select name="category" value={filters.category} onChange={handleFilterChange} className="form-select" style={{ marginTop: 8 }}>
                  <option value="">All Categories</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Arts & Science">Arts & Science</option>
                  <option value="Management">Management</option>
                </select>
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                College Type
                <select name="type" value={filters.type} onChange={handleFilterChange} className="form-select" style={{ marginTop: 8 }}>
                  <option value="">All Types</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Deemed">Deemed</option>
                </select>
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Max Annual Fee (₹)
                <input type="number" name="maxFee" value={filters.maxFee} onChange={handleFilterChange} className="form-input" placeholder="e.g. 200000" style={{ marginTop: 8 }} />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Max Cutoff Mark
                <input type="number" name="maxCutoff" value={filters.maxCutoff} onChange={handleFilterChange} className="form-input" placeholder="e.g. 185.5" style={{ marginTop: 8 }} />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Max NIRF Rank
                <input type="number" name="maxNirf" value={filters.maxNirf} onChange={handleFilterChange} className="form-input" placeholder="e.g. 100" style={{ marginTop: 8 }} />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Min Placement %
                <input type="number" name="minPlacement" value={filters.minPlacement} onChange={handleFilterChange} className="form-input" placeholder="e.g. 80" style={{ marginTop: 8 }} />
              </label>

              <button className="btn btn-ghost" onClick={() => setFilters({ category: '', type: '', city: '', maxNirf: '', minPlacement: '', maxFee: '', maxCutoff: '' })}>
                Clear All
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main>
          <div style={{ marginBottom: 20 }}>
            <h2 className="section-title">Found {colleges.length} Colleges</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading colleges...</div>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              {colleges.map(college => (
                <div key={college.id} className="card college-card-horizontal" style={{ display: 'flex', overflow: 'hidden', height: 220 }}>
                  <img 
                    src={college.imagePath || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400'} 
                    alt={college.name} 
                    style={{ width: 300, objectFit: 'cover' }} 
                  />
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="badge badge-teal" style={{ marginBottom: 8, display: 'inline-block' }}>{college.category}</span>
                          <h3 style={{ margin: 0 }}>{college.name}</h3>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {college.city}, {college.state}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>₹{college.minFee?.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg. Annual Fee</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 20, marginTop: 15 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{college.placementPercentage}%</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Placement</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>₹{college.avgPackage} LPA</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg Package</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>#{college.nirf}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>NIRF Rank</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                      <Link to={`/college/${college.id}`} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
                        View Details
                      </Link>
                      <button className="btn btn-ghost" style={{ padding: '8px 20px', fontSize: 13, border: '1px solid var(--border)' }}>
                        Compare
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}