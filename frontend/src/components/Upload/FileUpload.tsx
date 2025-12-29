import { useState, useRef } from 'react';
import axiosInstance from '../../utils/axios';
import './FileUpload.css';

interface FileUploadProps {
  uploadType: 'blog' | 'activity' | 'profile' | 'general';
  onUploadSuccess: (url: string, filename: string) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  currentImageUrl?: string;
  label?: string;
}

const FileUpload = ({
  uploadType,
  onUploadSuccess,
  onUploadError,
  multiple = false,
  maxFiles = 1,
  currentImageUrl,
  label = 'Resim Yükle',
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > maxFiles) {
      setError(`Maksimum ${maxFiles} dosya seçebilirsiniz.`);
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }
    }

    // Preview oluştur
    if (files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      
      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', files[0]);
      }
      
      formData.append('uploadType', uploadType);

      const endpoint = multiple ? '/upload/multiple' : '/upload/single';
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (multiple) {
        const uploadedFiles = response.data.data.files;
        uploadedFiles.forEach((file: any) => {
          onUploadSuccess(file.url, file.filename);
        });
      } else {
        const { url, filename } = response.data.data;
        onUploadSuccess(url, filename);
      }

      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Dosya yüklenirken bir hata oluştu.';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadSuccess('', '');
  };

  return (
    <div className="file-upload">
      <label className="file-upload-label">{label}</label>
      <div className="file-upload-container">
        {preview ? (
          <div className="file-upload-preview">
            <img src={preview} alt="Preview" />
            <div className="file-upload-actions">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary btn-sm"
                disabled={uploading}
              >
                Değiştir
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="btn-danger btn-sm"
                disabled={uploading}
              >
                Kaldır
              </button>
            </div>
          </div>
        ) : (
          <div
            className="file-upload-placeholder"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="file-upload-icon">📷</div>
            <p>{uploading ? 'Yükleniyor...' : 'Resim seçmek için tıklayın'}</p>
            <small>JPEG, PNG, GIF, WEBP (Max 5MB)</small>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          multiple={multiple}
          style={{ display: 'none' }}
        />
      </div>
      {error && <div className="file-upload-error">{error}</div>}
      {uploading && <div className="file-upload-loading">Yükleniyor...</div>}
    </div>
  );
};

export default FileUpload;

