import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';
import { mediaApi } from '../services/api';
import { formatFileSize } from '../utils/helpers';
import toast from 'react-hot-toast';

interface MediaUploadProps {
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
}

export default function MediaUpload({ onUploadComplete, maxFiles = 5 }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string }>>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const toastId = toast.loading('Uploading files...');

    try {
      const uploadPromises = acceptedFiles.map((file) => mediaApi.upload(file));
      const results = await Promise.all(uploadPromises);

      const newFiles = results.map((res) => ({
        url: res.data.data?.path || '',
        name: res.data.data?.original_name || '',
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      const allUrls = [...uploadedFiles, ...newFiles].map((f) => f.url);
      onUploadComplete(allUrls);

      toast.success('Files uploaded successfully!', { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload files', { id: toastId });
    } finally {
      setUploading(false);
    }
  }, [uploadedFiles, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploading || uploadedFiles.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles.map((f) => f.url));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        } ${uploading || uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <FiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop the files here...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Images (PNG, JPG, GIF) or Videos (MP4, MOV) - Max {maxFiles} files
            </p>
          </>
        )}
      </div>

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="grid grid-cols-2 gap-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group border border-gray-200 rounded-lg p-2 hover:border-primary-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <FiFile className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
