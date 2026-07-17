import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import uploadService from '../../services/uploadService';
import {
  FiFile, FiUpload, FiTrash2, FiSearch, FiDownload,
  FiFileText, FiImage, FiVideo, FiHeadphones, FiX, FiExternalLink
} from 'react-icons/fi';

const FILE_TYPE_ICONS = {
  pdf: FiFileText,
  document: FiFileText,
  image: FiImage,
  video: FiVideo,
  audio: FiHeadphones,
  other: FiFile,
};

const FILE_TYPE_COLORS = {
  pdf: 'text-red-600 bg-red-100',
  document: 'text-blue-600 bg-blue-100',
  image: 'text-green-600 bg-green-100',
  video: 'text-purple-600 bg-purple-100',
  audio: 'text-orange-600 bg-orange-100',
  other: 'text-gray-600 bg-gray-100',
};

export default function TeacherCourseMaterialsSection({ courseId, courseName, onBack }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null,
    fileType: 'document',
  });

  const fetchMaterials = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (fileTypeFilter) params.fileType = fileTypeFilter;
      const res = await teacherAcademicService.getCourseMaterials(courseId, params);
      const responseData = res?.data || res;
      setMaterials(responseData?.materials || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  }, [courseId, searchQuery, fileTypeFilter]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const resetUploadForm = () => {
    setUploadForm({ title: '', description: '', file: null, fileType: 'document' });
    setError(null);
    setSuccess(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine file type
    let fileType = 'document';
    const type = file.type;
    if (type.includes('pdf')) fileType = 'pdf';
    else if (type.includes('image')) fileType = 'image';
    else if (type.includes('video')) fileType = 'video';
    else if (type.includes('audio')) fileType = 'audio';

    setUploadForm(prev => ({ ...prev, file, fileType }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title.trim()) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      // Upload file first
      const uploadRes = await uploadService.uploadFile(uploadForm.file);
      const fileUrl = uploadRes?.data?.url || uploadRes?.url || '';

      // Add material record
      await teacherAcademicService.addCourseMaterial(courseId, {
        title: uploadForm.title.trim(),
        description: uploadForm.description.trim(),
        fileUrl,
        fileType: uploadForm.fileType,
        fileSize: uploadForm.file.size,
      });

      setSuccess('Material uploaded successfully');
      setShowUploadModal(false);
      resetUploadForm();
      fetchMaterials();
    } catch (err) {
      setError(err.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!confirm('Delete this material? This action cannot be undone.')) return;
    try {
      await teacherAcademicService.deleteCourseMaterial(courseId, index);
      setSuccess('Material deleted successfully');
      fetchMaterials();
    } catch (err) {
      setError(err.message || 'Failed to delete material');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-bg-light rounded-lg transition-colors">
              <FiExternalLink className="w-5 h-5 text-text-light rotate-180" />
            </button>
          )}
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">
              {courseName ? `${courseName} - Materials` : 'Course Materials'}
            </h2>
            <p className="text-sm text-text-light mt-1">
              {materials.length} {materials.length === 1 ? 'material' : 'materials'} uploaded
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetUploadForm(); setShowUploadModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
        >
          <FiUpload className="w-4 h-4" />
          Upload Material
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
          />
        </div>
        <select
          value={fileTypeFilter}
          onChange={e => setFileTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
        >
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="document">Document</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-bg-light rounded-full flex items-center justify-center mb-4">
            <FiFile className="w-8 h-8 text-text-light" />
          </div>
          <p className="text-text-light font-medium">No materials uploaded yet</p>
          <p className="text-sm text-text-light mt-2">Upload your first course material to get started</p>
          <button
            onClick={() => { resetUploadForm(); setShowUploadModal(true); }}
            className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            <FiUpload className="w-4 h-4 inline mr-2" />
            Upload Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material, index) => {
            const FileIcon = FILE_TYPE_ICONS[material.fileType] || FiFile;
            const colorClass = FILE_TYPE_COLORS[material.fileType] || 'text-gray-600 bg-gray-100';
            return (
              <div
                key={index}
                className="group relative p-4 rounded-xl border border-border-light hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${colorClass} flex-shrink-0`}>
                    <FileIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-dark text-sm truncate">{material.title}</h3>
                    {material.description && (
                      <p className="text-xs text-text-light mt-0.5 line-clamp-2">{material.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-light">
                      <span className="capitalize">{material.fileType}</span>
                      {material.fileSize > 0 && <span>{formatFileSize(material.fileSize)}</span>}
                      {material.uploadedAt && <span>{formatDate(material.uploadedAt)}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {material.fileUrl && (
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-bg-light rounded-lg transition-colors"
                      title="Download"
                    >
                      <FiDownload className="w-4 h-4 text-primary" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">Upload Material</h3>
              <button
                onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                className="text-text-light hover:text-text-dark"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="e.g. Chapter 1 Notes"
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={e => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="Brief description of the material"
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">File *</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    required
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                  />
                </div>
                {uploadForm.file && (
                  <p className="text-xs text-text-light mt-1">
                    Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">File Type</label>
                <select
                  value={uploadForm.fileType}
                  onChange={e => setUploadForm(prev => ({ ...prev, fileType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="document">Document</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.file || !uploadForm.title.trim()}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                  className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
