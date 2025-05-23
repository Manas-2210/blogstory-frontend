import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPost();
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from navigation state
      window.history.replaceState({}, document.title);
    }
  }, [id, location.state]);

  useEffect(() => {
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getPostById(id);
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 404) {
        setError('Post not found. It may have been deleted or the URL is incorrect.');
      } else {
        setError('Failed to load post. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await postsAPI.deletePost(id);
      navigate('/my-posts', { 
        state: { message: 'Post deleted successfully!' }
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAuthor = user && post && user.id === post.author_id;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchPost} className="btn btn-primary">
              Try Again
            </button>
            <Link to="/" className="btn btn-outline">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="not-found">
          <h3>Post not found</h3>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {successMessage}
        </div>
      )}

      <article className="post-detail">
        <header className="post-header">
          <div className="post-breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Post Detail</span>
          </div>

          <h1 className="post-title">{post.title}</h1>
          
          <div className="post-meta">
            <div className="meta-info">
              <span className="post-author">
                <strong>By {post.author}</strong>
              </span>
              <span className="post-date">
                Published on {formatDate(post.created_at)}
              </span>
              {post.updated_at !== post.created_at && (
                <span className="post-updated">
                  Last updated on {formatDate(post.updated_at)}
                </span>
              )}
            </div>

            {isAuthor && (
              <div className="post-actions">
                <Link 
                  to={`/edit/${post.id}`} 
                  className="btn btn-outline btn-small"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger btn-small"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      Deleting...
                    </>
                  ) : (
                    <>🗑️ Delete</>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="post-content">
          <div 
            className="content-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <footer className="post-footer">
          <div className="post-tags">
            <span className="tag">📝 Blog Post</span>
            <span className="tag">👤 {post.author}</span>
          </div>
          
          <div className="post-navigation">
            <Link to="/" className="btn btn-outline">
              ← Back to All Posts
            </Link>
            {isAuthor && (
              <Link to="/my-posts" className="btn btn-outline">
                My Posts →
              </Link>
            )}
          </div>
        </footer>
      </article>

      {/* Related Posts Section - Future Enhancement */}
      <section className="related-posts">
        <h3>More from {post.author}</h3>
        <p className="coming-soon">
          Related posts feature coming soon!
        </p>
      </section>
    </div>
  );
};

export default PostDetail;