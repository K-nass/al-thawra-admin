import React, { useState } from 'react';
import { VideoService } from '../../api/videoService';
import type { VideoUploadResponse, VideoUploadProgress } from '../../types/video';

const VideoUploadExample: React.FC = () => {
  const [uploadResponse, setUploadResponse] = useState<VideoUploadResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const response = await VideoService.uploadVideo({
        file,
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        }
      });

      setUploadResponse(response);
      console.log('Upload response:', response);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const checkUploadStatus = async () => {
    if (!uploadResponse?.uploadId) return;

    try {
      const status = await VideoService.getUploadStatus(uploadResponse.uploadId);
      setUploadResponse(status);
      console.log('Updated status:', status);
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        مثال على رفع الفيديو
      </h2>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر ملف فيديو
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">حالة الرفع</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>الحالة:</span>
              <span className="font-medium">
                {uploadProgress.status === 'Uploading' && 'جاري الرفع'}
                {uploadProgress.status === 'Processing' && 'جاري المعالجة'}
                {uploadProgress.status === 'Completed' && 'مكتمل'}
                {uploadProgress.status === 'Failed' && 'فشل'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>التقدم:</span>
              <span>{uploadProgress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  uploadProgress.status === 'Failed' ? 'bg-red-500' : 
                  uploadProgress.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{uploadProgress.message}</p>
            
            {uploadProgress.thumbnailUrl && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">الصورة المصغرة:</p>
                <img 
                  src={uploadProgress.thumbnailUrl} 
                  alt="Video thumbnail" 
                  className="w-48 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Response */}
      {uploadResponse && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-green-900">استجابة الرفع</h3>
            <button
              onClick={checkUploadStatus}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              تحديث الحالة
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>معرف الرفع:</strong>
                <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
                  {uploadResponse.uploadId}
                </p>
              </div>
              <div>
                <strong>اسم الملف:</strong>
                <p>{uploadResponse.fileName}</p>
              </div>
              <div>
                <strong>الحالة:</strong>
                <span className={`px-2 py-1 rounded text-xs ${
                  uploadResponse.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  uploadResponse.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                  uploadResponse.status === 'Failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {uploadResponse.status}
                </span>
              </div>
              <div>
                <strong>تاريخ الرفع:</strong>
                <p>{new Date(uploadResponse.uploadedAt).toLocaleString('ar-SA')}</p>
              </div>
            </div>
            
            <div>
              <strong>الرسالة:</strong>
              <p>{uploadResponse.message}</p>
            </div>

            {uploadResponse.videoUrl && (
              <div>
                <strong>رابط الفيديو:</strong>
                <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 break-all">
                  {uploadResponse.videoUrl}
                </p>
              </div>
            )}

            {uploadResponse.thumbnailUrl && (
              <div>
                <strong>رابط الصورة المصغرة:</strong>
                <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 break-all">
                  {uploadResponse.thumbnailUrl}
                </p>
              </div>
            )}

            {uploadResponse.duration && (
              <div>
                <strong>المدة:</strong>
                <p>{uploadResponse.duration}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Example */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          مثال على استجابة API الفعلية
        </h3>
        
        <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
{`{
  "uploadId": "fc0f0789-7efc-4c62-a713-ab417b36eafe",
  "fileName": "Dummy Video For Website.mp4",
  "status": "Pending",
  "message": "Video upload started. Processing in background (includes thumbnail generation).",
  "uploadedAt": "2025-11-12T18:00:06.1990794Z",
  "signalRHubUrl": "/hubs/media-upload"
}`}
        </pre>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>ملاحظة:</strong> هذا مثال على الاستجابة الفعلية من API الخاص بك.</p>
          <p>يمكنك استخدام <code>uploadId</code> لتتبع حالة الرفع.</p>
          <p>سيتم إنشاء الصورة المصغرة تلقائياً في الخلفية.</p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          تعليمات الاستخدام
        </h3>
        
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>اختر ملف فيديو (MP4, AVI, MOV, WebM)</li>
          <li>سيبدأ الرفع تلقائياً وستظهر شريط التقدم</li>
          <li>بعد الرفع، ستحصل على معرف الرفع (uploadId)</li>
          <li>يمكنك استخدام "تحديث الحالة" لمراقبة المعالجة</li>
          <li>عند اكتمال المعالجة، ستحصل على روابط الفيديو والصورة المصغرة</li>
          <li>استخدم هذه الروابط في نموذج إنشاء الفيديو</li>
        </ol>
      </div>
    </div>
  );
};

export default VideoUploadExample;
