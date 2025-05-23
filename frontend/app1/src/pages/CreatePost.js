import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { postsAPI } from '../services/api';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const navigate = useNavigate();

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

    setLoading(true);
    setErrors({});

    try {
      const result = await postsAPI.createPost(formData);
      navigate(`/post/${result.post.id}`, { 
        state: { message: 'Post created successfully!' }
      });
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ 
        general: error.response?.data?.error || 'Failed to create post. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="container">
      <div className="create-post-header">
        <h1>Create New Post</h1>
        <p>Share your thoughts and ideas with the community</p>
      </div>

      {errors.general && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Post Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter an engaging title for your post"
            className={`form-input ${errors.title ? 'error' : ''}`}
            disabled={loading}
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
                placeholder: 'Start writing your amazing content here...',
                wordCount: {
                  onUpdate: (stats) => {
                    // Optional: You can track word count here
                  }
                }
              }}
              disabled={loading}
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !editorReady}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Publishing...
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>

      {/* Fallback textarea if CKEditor fails */}
      <div className="editor-fallback" style={{ display: 'none' }}>
        <div className="form-group">
          <label htmlFor="content-fallback">Content (Plain Text) *</label>
          <textarea
            id="content-fallback"
            name="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your post content here..."
            className={`form-textarea ${errors.content ? 'error' : ''}`}
            rows={15}
            disabled={loading}
          />
          {errors.content && <span className="field-error">{errors.content}</span>}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
