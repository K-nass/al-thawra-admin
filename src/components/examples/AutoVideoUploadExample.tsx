import React, { useState } from 'react';
import { VideoService } from '../../api/videoService';
import type { VideoUploadResponse, VideoUploadProgress } from '../../types/video';

const AutoVideoUploadExample: React.FC = () => {
  const [uploadResponse, setUploadResponse] = useState<VideoUploadResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleAutoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(null);
    setIsReady(false);

    try {
      console.log('🚀 Starting automatic upload and processing...');
      
      // Use the new automatic method that waits for completion
      const finalResponse = await VideoService.uploadVideoAndWaitForCompletion({
        file,
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log(`📊 Progress: ${progress.progress}% - ${progress.message}`);
        },
        maxWaitTime: 300000 // 5 minutes
      });

      setUploadResponse(finalResponse);
      
      // Check if we have the URLs ready
      if (finalResponse.status === 'Completed' && finalResponse.videoUrl && finalResponse.thumbnailUrl) {
        setIsReady(true);
        console.log('✅ READY TO SUBMIT!');
        console.log('📹 Video URL:', finalResponse.videoUrl);
        console.log('🖼️ Thumbnail URL:', finalResponse.thumbnailUrl);
        console.log('⏱️ Duration:', finalResponse.duration);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('❌ Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🚀 رفع تلقائي للفيديو مع الحصول على الروابط
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-900 mb-2">كيف يعمل:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>اختر ملف فيديو</li>
          <li>سيتم الرفع تلقائياً</li>
          <li>سينتظر النظام حتى اكتمال المعالجة</li>
          <li>سيحصل على روابط الفيديو والصورة المصغرة تلقائياً</li>
          <li>النموذج جاهز للإرسال!</li>
        </ol>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر ملف فيديو للرفع التلقائي
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleAutoUpload}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">📊 حالة الرفع</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>الحالة:</span>
              <span className="font-medium">
                {uploadProgress.status === 'Uploading' && '📤 جاري الرفع'}
                {uploadProgress.status === 'Processing' && '⚙️ جاري المعالجة'}
                {uploadProgress.status === 'Completed' && '✅ مكتمل'}
                {uploadProgress.status === 'Failed' && '❌ فشل'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>التقدم:</span>
              <span>{uploadProgress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  uploadProgress.status === 'Failed' ? 'bg-red-500' : 
                  uploadProgress.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{uploadProgress.message}</p>
          </div>
        </div>
      )}

      {/* Ready Indicator */}
      {isReady && uploadResponse && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                🎉 جاهز للإرسال!
              </h3>
              <p className="text-sm text-green-700">
                تم الحصول على جميع الروابط المطلوبة تلقائياً
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <strong className="text-green-800">📹 رابط الفيديو:</strong>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                {uploadResponse.videoUrl}
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <strong className="text-green-800">🖼️ رابط الصورة المصغرة:</strong>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                {uploadResponse.thumbnailUrl}
              </p>
            </div>
            {uploadResponse.duration && (
              <div className="bg-white p-3 rounded border">
                <strong className="text-green-800">⏱️ المدة:</strong>
                <p className="mt-1">{uploadResponse.duration}</p>
              </div>
            )}
            <div className="bg-white p-3 rounded border">
              <strong className="text-green-800">📁 اسم الملف:</strong>
              <p className="mt-1">{uploadResponse.fileName}</p>
            </div>
          </div>

          {/* Show thumbnail preview */}
          {uploadResponse.thumbnailUrl && (
            <div className="mt-4">
              <strong className="text-green-800">🖼️ معاينة الصورة المصغرة:</strong>
              <div className="mt-2">
                <img 
                  src={uploadResponse.thumbnailUrl} 
                  alt="Video thumbnail" 
                  className="w-64 h-36 object-cover rounded border shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-green-100 rounded">
            <p className="text-sm text-green-800">
              <strong>✅ النموذج جاهز الآن!</strong> يمكنك استخدام هذه الروابط في نموذج إنشاء الفيديو.
            </p>
          </div>
        </div>
      )}

      {/* Upload Response Details */}
      {uploadResponse && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📋 تفاصيل الاستجابة
          </h3>
          <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
            {JSON.stringify(uploadResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* Usage Example */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          💡 مثال على الاستخدام في الكود
        </h3>
        
        <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
{`// استخدام الطريقة التلقائية
const handleUpload = async (file: File) => {
  const response = await VideoService.uploadVideoAndWaitForCompletion({
    file,
    onProgress: (progress) => {
      console.log(\`\${progress.progress}% - \${progress.message}\`);
    }
  });
  
  // الآن لديك الروابط جاهزة!
  console.log('Video URL:', response.videoUrl);
  console.log('Thumbnail URL:', response.thumbnailUrl);
  
  // يمكنك إنشاء المنشور مباشرة
  const videoPost = await VideoService.createVideo(categoryId, {
    title: "عنوان الفيديو",
    content: "وصف الفيديو", 
    videoFileUrls: [response.videoUrl],
    videoThumbnailUrl: response.thumbnailUrl,
    // ... باقي البيانات
  });
};`}
        </pre>
      </div>
    </div>
  );
};

export default AutoVideoUploadExample;
