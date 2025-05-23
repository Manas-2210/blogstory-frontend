import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const post = await postsAPI.getPostById(id);
      
      // Check if user is the author
      if (!user || user.id !== post.author_id) {
        navigate('/', { 
          state: { error: 'You can only edit your own posts.' }
        });
        return;
      }

      const postData = {
        title: post.title,
        content: post.content
      };
      
      setFormData(postData);
      setOriginalData(postData);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 404) {
        navigate('/', { 
          state: { error: 'Post not found.' }
        });
      } else {
        setErrors({ 
          general: 'Failed to load post. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    return newErrors;
  };

  const hasChanges = () => {
    return formData.title !== originalData.title || 
           formData.content !== originalData.content;
  };

  const handleTitleChange = (e) => {
    setFormData({
      ...formData,
      title: e.target.value
    });
    
    if (errors.title) {
      setErrors({
        ...errors,
        title: ''
      });
    }
  };

  const handleContentChange = (event, editor) => {
    const data = editor.getData();
    setFormData({
      ...formData,
      content: data
    });
    
    if (errors.content) {
      setErrors({
        ...errors,
        content: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!hasChanges()) {
      navigate(`/post/${id}`, {
        state: { message: 'No changes were made to the post.' }
      });
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      await postsAPI.updatePost(id, formData);
      navigate(`/post/${id}`, { 
        state: { message: 'Post updated successfully!' }
      });
    } catch (error) {
      console.error('Error updating post:', error);
      setErrors({ 
        general: error.response?.data?.error || 'Failed to update post. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        navigate(`/post/${id}`);
      }
    } else {
      navigate(`/post/${id}`);
    }
  };

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

  return (
    <div className="container">
      <div className="edit-post-header">
        <h1>Edit Post</h1>
        <p>Make changes to your blog post</p>
      </div>

      {errors.general && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-post-form">
        <div className="form-group">
          <label htmlFor="title">Post Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter post title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            disabled={saving}
            maxLength={255}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
          <small className="char-count">
            {formData.title.length}/255 characters
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <div className="editor-container">
            <CKEditor
              editor={ClassicEditor}
              data={formData.content}
              onChange={handleContentChange}
              onReady={() => {
                setEditorReady(true);
              }}
              onError={(error) => {
                console.error('CKEditor error:', error);
                setErrors({
                  ...errors,
                  content: 'Editor failed to load. Please refresh the page.'
                });
              }}
              config={{
                toolbar: [
                  'heading',
                  '|',
                  'bold',
                  'italic',
                  'underline',
                  'strikethrough',
                  '|',
                  'bulletedList',
                  'numberedList',
                  '|',
                  'outdent',
                  'indent',
                  '|',
                  'blockQuote',
                  'insertTable',
                  '|',
                  'link',
                  '|',
                  'undo',
                  'redo'
                ],
                placeholder: 'Edit your content here...'
              }}
              disabled={saving}
            />
          </div>
          {errors.content && <span className="field-error">{errors.content}</span>}
          {!editorReady && (
            <div className="editor-loading">
              <span className="spinner-small"></span>
              Loading editor...
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || !editorReady || !hasChanges()}
          >
            {saving ? (
              <>
                <span className="spinner-small"></span>
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

        {hasChanges() && (
          <div className="unsaved-changes">
            <span className="warning-icon">⚠️</span>
            You have unsaved changes
          </div>
        )}
      </form>
    </div>
  );
};

export default EditPost;