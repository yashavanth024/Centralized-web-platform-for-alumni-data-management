import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import './AdminNews.css';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    image_url: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/news');
      setNews(response.data.news || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/news', formData);
      toast.success('News published successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        category: 'General',
        image_url: ''
      });
      fetchNews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish news');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="admin-news">
        <div className="page-header">
          <div>
            <h2>News Management</h2>
            <p>Publish and manage institutional news</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '📰 Publish News'}
          </button>
        </div>

        {/* Create News Form */}
        {showForm && (
          <div className="create-form">
            <h3>Publish News Article</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="General">General</option>
                    <option value="Achievements">Achievements</option>
                    <option value="Events">Events</option>
                    <option value="Alumni">Alumni Stories</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL (Optional)</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="8"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Publish News
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* News List */}
        <div className="news-list">
          <h3>Published News ({news.length})</h3>
          
          {loading ? (
            <div className="loading">Loading news...</div>
          ) : news.length === 0 ? (
            <div className="no-news">
              <p>No news articles published yet.</p>
            </div>
          ) : (
            <div className="news-grid">
              {news.map(item => (
                <div key={item.id} className="news-card">
                  {item.image_url && (
                    <div className="news-image">
                      <img src={item.image_url} alt={item.title} />
                    </div>
                  )}
                  
                  <div className="news-content">
                    <div className="news-meta">
                      <span className="category-badge">{item.category}</span>
                      <span className="news-date">{formatDate(item.created_at)}</span>
                      <span className="news-author">
                        By: {item.first_name} {item.last_name || 'Admin'}
                      </span>
                    </div>
                    
                    <h4>{item.title}</h4>
                    <p className="news-excerpt">
                      {item.content.substring(0, 150)}...
                    </p>
                    
                    <div className="news-actions">
                      <span className={`status-badge ${item.is_published ? 'published' : 'draft'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                      <div className="action-buttons">
                        <button className="btn btn-sm">Edit</button>
                        <button className="btn btn-sm btn-outline">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNews;