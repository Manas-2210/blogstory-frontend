import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyPosts = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});

  useEffect(() => {
    fetchMyPosts();
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getMyPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load your posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, postTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading({ ...deleteLoading, [postId]: true });
      await postsAPI.deletePost(postId);
      
      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postId));
      setSuccessMessage('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    } finally {
      setDeleteLoading({ ...deleteLoading, [postId]: false });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="my-posts-header">
        <div className="header-content">
          <h1>My Posts</h1>
          <p>Manage your blog posts</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          ✏️ Write New Post
        </Link>
      </div>

      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            onClick={() => setError('')} 
            className="btn btn-small btn-outline"
            style={{ marginLeft: '10px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="posts-stats">
        <div className="stat-card">
          <h3>{posts.length}</h3>
          <p>Total Posts</p>
        </div>
        <div className="stat-card">
          <h3>{user?.username}</h3>
          <p>Author</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <div className="no-posts-icon">📝</div>
          <h3>No posts yet</h3>
          <p>You haven't written any blog posts yet. Start sharing your thoughts and ideas!</p>
          <Link to="/create" className="btn btn-primary">
            Write Your First Post
          </Link>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card my-post-card">
              <div className="post-header">
                <h2 className="post-title">
                  <Link to={`/post/${post.id}`}>{post.title}</Link>
                </h2>
                <div className="post-meta">
                  <span className="post-date">
                    Created: {formatDate(post.created_at)}
                  </span>
                  {post.updated_at !== post.created_at && (
                    <span className="post-updated">
                      Updated: {formatDate(post.updated_at)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="post-summary">
                <p>{stripHtml(post.summary)}</p>
              </div>
              
              <div className="post-actions">
                <Link 
                  to={`/post/${post.id}`} 
                  className="btn btn-outline btn-small"
                >
                  👁️ View
                </Link>
                <Link 
                  to={`/edit/${post.id}`} 
                  className="btn btn-outline btn-small"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="btn btn-danger btn-small"
                  disabled={deleteLoading[post.id]}
                >
                  {deleteLoading[post.id] ? (
                    <>
                      <span className="spinner-small"></span>
                      Deleting...
                    </>
                  ) : (
                    <>🗑️ Delete</>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className="posts-footer">
          <p>
            Showing all {posts.length} post{posts.length !== 1 ? 's' : ''}
          </p>
          <Link to="/create" className="btn btn-primary">
            ✏️ Write Another Post
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPosts;