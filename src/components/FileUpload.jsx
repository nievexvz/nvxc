// src/components/FileUpload.jsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { uploadToCDN } from '../lib/github';

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Max file size 25MB (GitHub limit)
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = '';
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert(`⚠️ ${oversizedFiles.length} file melebihi batas 25MB dan akan dilewati:\n${oversizedFiles.map(f => f.name).join('\n')}`);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    // Upload files sequentially to avoid GitHub API rate limits
    for (const file of validFiles) {
      await uploadFile(file);
    }
    
    setIsUploading(false);
  };

  const uploadFile = async (file) => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    try {
      const result = await uploadToCDN(file, fileName);
      
      if (result.success) {
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          url: result.url,
          type: file.type,
          size: file.size,
          sha: result.sha,
          fileName: fileName,
          uploadTime: new Date().toLocaleString('id-ID')
        }]);
      } else {
        alert(`❌ Gagal upload ${file.name}: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error upload ${file.name}: ${error.message}`);
    }
  };

  const copyToClipboard = async (text, event) => {
    try {
      await navigator.clipboard.writeText(text);
      const button = event.target.closest('button');
      const originalHTML = button.innerHTML;
      button.innerHTML = '<iconify-icon icon="mdi:check" class="w-4 h-4 text-green-400"></iconify-icon>';
      setTimeout(() => {
        button.innerHTML = originalHTML;
      }, 2000);
    } catch (err) {
      console.error('Gagal copy: ', err);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'mdi:image';
    if (type.includes('zip') || type.includes('archive') || type.includes('compressed')) return 'mdi:archive';
    if (type.includes('pdf')) return 'mdi:file-pdf';
    if (type.includes('text') || type.includes('document')) return 'mdi:file-document';
    if (type.includes('video')) return 'mdi:video';
    if (type.includes('audio')) return 'mdi:music';
    return 'mdi:file';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type) => {
    if (type.startsWith('image/')) return 'text-green-400';
    if (type.includes('video')) return 'text-purple-400';
    if (type.includes('audio')) return 'text-pink-400';
    if (type.includes('pdf')) return 'text-red-400';
    if (type.includes('zip') || type.includes('archive')) return 'text-yellow-400';
    return 'text-blue-400';
  };

  // Calculate total size of uploaded files
  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 border border-slate-700/50 shadow-2xl"
      >
        <div
          className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-500 ${
            isDragging 
              ? 'border-blue-400 bg-blue-500/10 scale-105' 
              : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Icon 
            icon="mdi:cloud-upload-outline" 
            className="w-20 h-20 mx-auto mb-6 text-slate-400" 
          />
          <h3 className="text-2xl font-bold text-white mb-3">
            Upload Files ke CDN
          </h3>
          <p className="text-slate-400 mb-2 text-lg">
            Drag & drop file di sini atau klik untuk memilih
          </p>
          <p className="text-slate-500 mb-6 text-sm">
            Maksimal 25MB per file
          </p>
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Pilih Files'
            )}
          </motion.button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            disabled={isUploading}
            className="hidden"
          />
        </div>

        {/* File Size Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-slate-800/30 rounded-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-sm">Max File Size</p>
              <p className="text-white font-semibold">25 MB</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Uploaded</p>
              <p className="text-white font-semibold">{uploadedFiles.length} files</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Size</p>
              <p className="text-white font-semibold">{formatFileSize(totalSize)}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-3xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  File Terupload ({uploadedFiles.length})
                </h3>
                <p className="text-slate-400 text-sm">
                  Total size: {formatFileSize(totalSize)}
                </p>
              </div>
              <motion.button
                onClick={clearAllFiles}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Icon icon="mdi:delete-sweep" className="w-4 h-4" />
                <span>Hapus Semua</span>
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition-colors duration-300 group"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`p-3 bg-slate-700/50 rounded-lg ${getFileTypeColor(file.type)}`}>
                      <Icon icon={getFileIcon(file.type)} className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate text-sm">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.uploadTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      onClick={(e) => copyToClipboard(file.url, e)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
                      title="Copy URL"
                    >
                      <Icon icon="mdi:content-copy" className="w-4 h-4" />
                      <span>Copy</span>
                    </motion.button>
                    
                    <motion.a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
                      title="Buka File"
                    >
                      <Icon icon="mdi:eye" className="w-4 h-4" />
                    </motion.a>
                    
                    <motion.button
                      onClick={() => removeFile(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-colors duration-200"
                      title="Hapus File"
                    >
                      <Icon icon="mdi:close" className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
<AnimatePresence>
  {isUploading && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="glass rounded-2xl p-6 border border-slate-700/50"
    >
      <div className="flex items-center space-x-4">
        {/* Spinner hijau */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>

        <div className="flex-1">
          <p className="text-white font-medium">Mengupload file...</p>
          <p className="text-slate-400 text-sm">
            File besar mungkin membutuhkan waktu beberapa saat
          </p>
        </div>
      </div>

      {/* Progress bar hijau */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full mt-3"
      />
    </motion.div>
  )}
</AnimatePresence>

      {/* File Type Support Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="glass rounded-2xl p-6 border border-slate-700/50"
      >
        <h4 className="text-lg font-semibold text-white mb-4">File yang Didukung</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <Icon icon="mdi:image" className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white text-sm">Gambar</p>
            <p className="text-slate-400 text-xs">JPG, PNG, GIF</p>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <Icon icon="mdi:file-pdf" className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-white text-sm">Dokumen</p>
            <p className="text-slate-400 text-xs">PDF, DOC, TXT</p>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <Icon icon="mdi:archive" className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-white text-sm">Archive</p>
            <p className="text-slate-400 text-xs">ZIP, RAR, 7Z</p>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <Icon icon="mdi:video" className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-sm">Media</p>
            <p className="text-slate-400 text-xs">MP4, MP3, AVI</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUpload;
