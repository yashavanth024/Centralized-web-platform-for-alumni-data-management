import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="news-page">
      <div className="container">
        <div className="page-header">
          <h1>News & Updates</h1>
          <p>Stay informed about institutional achievements and alumni accomplishments</p>
        </div>

        {loading ? (
          <div className="loading">Loading news...</div>
        ) : news.length === 0 ? (
          <div className="no-news">
            <p>No news updates available at the moment.</p>
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
                    <span className="news-category">{item.category || 'General'}</span>
                    <span className="news-date">{formatDate(item.created_at)}</span>
                    {item.author_id && (
                      <span className="news-author">By {item.first_name} {item.last_name}</span>
                    )}
                  </div>
                  
                  <h3>{item.title}</h3>
                  <p className="news-excerpt">{item.content}</p>
                  
                  <div className="news-actions">
                    <button className="btn btn-outline">Read More</button>
                    <div className="share-options">
                      <button className="share-btn">📤 Share</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="news-sidebar">
          <div className="sidebar-card">
            <h3>Categories</h3>
            <ul className="category-list">
              <li><a href="#all">All News</a></li>
              <li><a href="#achievements">Achievements</a></li>
              <li><a href="#events">Event Updates</a></li>
              <li><a href="#alumni">Alumni Stories</a></li>
              <li><a href="#institutional">Institutional</a></li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>Subscribe</h3>
            <p>Get news updates directly in your inbox</p>
            <div className="subscribe-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="form-control"
              />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;