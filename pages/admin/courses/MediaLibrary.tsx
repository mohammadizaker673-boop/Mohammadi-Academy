import React, { useState, useEffect } from 'react';
import { Image, Video, FileText, Music, Upload, Search, Trash2, Copy, Check, Filter, X } from 'lucide-react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FileType, deleteFile as deleteStorageFile } from '../../../services/storageService';
import FileUploader from '../../../components/admin/FileUploader';

interface MediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
  fileSize: number;
  uploadedBy: string;
  tags?: string[];
  createdAt: Date;
}

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FileType | 'all'>('all');
  const [showUploader, setShowUploader] = useState(false);
  const [uploadType, setUploadType] = useState<FileType>('image');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, images: 0, videos: 0, pdfs: 0, audio: 0, documents: 0 });

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [mediaFiles]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'mediaFiles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as MediaFile[];
      
      setMediaFiles(files);
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: mediaFiles.length,
      images: mediaFiles.filter(f => f.fileType === 'image').length,
      videos: mediaFiles.filter(f => f.fileType === 'video').length,
      pdfs: mediaFiles.filter(f => f.fileType === 'pdf').length,
      audio: mediaFiles.filter(f => f.fileType === 'audio').length,
      documents: mediaFiles.filter(f => f.fileType === 'document').length,
    };
    setStats(stats);
  };

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    try {
      await addDoc(collection(db, 'mediaFiles'), {
        fileName,
        fileUrl: url,
        fileType: uploadType,
        fileSize,
        uploadedBy: 'admin', // In real app, use auth.currentUser.uid
        tags: [],
        createdAt: Timestamp.now()
      });
      
      fetchMediaFiles();
    } catch (error) {
      console.error('Error saving media metadata:', error);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Are you sure you want to delete "${file.fileName}"?`)) return;

    try {
      // Delete from Storage
      await deleteStorageFile(file.fileUrl);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'mediaFiles', file.id));
      
      alert('File deleted successfully!');
      fetchMediaFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || file.fileType === selectedType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-6 h-6" />;
      case 'audio':
        return <Music className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Upload className="text-primary-500" size={32} />
          Media Library
        </h1>
        <p className="text-white mt-2">Upload and manage all your course media files</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white">Total Files</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white">Images</p>
          <p className="text-2xl font-bold text-primary-600">{stats.images}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white">Videos</p>
          <p className="text-2xl font-bold text-accent-600">{stats.videos}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white">PDFs</p>
          <p className="text-2xl font-bold text-red-600">{stats.pdfs}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white">Audio</p>
          <p className="text-2xl font-bold text-green-600">{stats.audio}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white">Docs</p>
          <p className="text-2xl font-bold text-orange-600">{stats.documents}</p>
        </div>
      </div>

      {/* Upload Section */}
      {showUploader ? (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Upload New File</h2>
            <button
              onClick={() => setShowUploader(false)}
              className="p-2 text-white hover:text-white hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-white mb-2">
              File Type
            </label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as FileType)}
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
            </select>
          </div>

          <FileUploader
            fileType={uploadType}
            folder="courses"
            onUploadComplete={(url) => {
              // Extract filename from URL
              const fileName = url.split('/').pop()?.split('?')[0] || 'file';
              handleUploadComplete(url, fileName, 0);
            }}
            maxFiles={5}
          />
        </div>
      ) : (
        <div className="mb-6">
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition"
          >
            <Upload size={20} />
            Upload Files
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={20} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              />
            </div>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as FileType | 'all')}
            className="px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Files ({filteredFiles.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading media files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-12 text-center">
            <Upload className="mx-auto text-white mb-4" size={48} />
            <p className="text-white">No files found. Upload your first file!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="group border bg-slate-900 border-white/10 rounded-lg overflow-hidden hover:shadow-lg transition text-white text-white"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {file.fileType === 'image' ? (
                    <img
                      src={file.fileUrl}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white">
                      {getFileIcon(file.fileType)}
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyToClipboard(file.fileUrl)}
                      className="p-2 bg-slate-800 rounded-lg hover:bg-gray-100 transition"
                      title="Copy URL"
                    >
                      {copiedUrl === file.fileUrl ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 bg-slate-800 rounded-lg hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-4">
                  <p className="text-sm font-medium text-white truncate" title={file.fileName}>
                    {file.fileName}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-white">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      file.fileType === 'image' ? 'bg-sky-100 text-sky-700' :
                      file.fileType === 'video' ? 'bg-purple-100 text-purple-700' :
                      file.fileType === 'pdf' ? 'bg-red-100 text-red-700' :
                      file.fileType === 'audio' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {file.fileType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
