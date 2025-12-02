import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VideoService } from '../../api/videoService';
import type { VideoUploadProgress } from '../../types/video';

interface VideoFormData {
  title: string;
  slug: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  visibility: boolean;
  addToSlider: boolean;
  addToFeatured: boolean;
  addToBreaking: boolean;
  addToRecommended: boolean;
  showOnlyToRegisteredUsers: boolean;
  tagIds: string[];
  optionalURL: string | null;
  content: string;
  videoUrl: string | null;
  videoEmbedCode: string | null;
  videoThumbnailUrl: string;
  duration: string | null;
  videoFileUrls: string[];
  categoryId: string;
  language: 'English' | 'Arabic';
  authorId: string | null;
  scheduledAt: string | null;
  status: 'Draft' | 'Scheduled' | 'Published';
}

interface VideoCreationFormProps {
  categoryId: string;
  onSubmit: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const VideoCreationForm: React.FC<VideoCreationFormProps> = ({
  categoryId,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    slug: null,
    metaDescription: null,
    metaKeywords: null,
    visibility: true,
    addToSlider: false,
    addToFeatured: false,
    addToBreaking: false,
    addToRecommended: false,
    showOnlyToRegisteredUsers: false,
    tagIds: [],
    optionalURL: null,
    content: '',
    videoUrl: null,
    videoEmbedCode: null,
    videoThumbnailUrl: '',
    duration: null,
    videoFileUrls: [],
    categoryId,
    language: 'Arabic',
    authorId: null,
    scheduledAt: null,
    status: 'Draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [videoType, setVideoType] = useState<'external' | 'upload'>('external');
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('validation.titleRequired');
    }

    if (!formData.content.trim()) {
      newErrors.content = t('validation.contentRequired');
    }

    if (videoType === 'external') {
      if (formData.videoUrl && !formData.videoEmbedCode) {
        newErrors.videoEmbedCode = t('validation.embedCodeRequired');
      }
      if (!formData.videoUrl && formData.videoEmbedCode) {
        newErrors.videoUrl = t('validation.videoUrlRequired');
      }
    }

    if (videoType === 'upload' && formData.videoFileUrls.length === 0) {
      newErrors.videoFileUrls = t('validation.videoFileRequired');
    }

    if (!formData.videoThumbnailUrl.trim()) {
      newErrors.videoThumbnailUrl = t('validation.thumbnailRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating video:', error);
    }
  };

  const handleInputChange = (field: keyof VideoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVideoTypeChange = (type: 'external' | 'upload') => {
    setVideoType(type);
    // Clear video-related fields when switching types
    setFormData(prev => ({
      ...prev,
      videoUrl: null,
      videoEmbedCode: null,
      videoFileUrls: []
    }));
    setSelectedFile(null);
    setUploadProgress(null);
    setIsFormReady(false); // Reset form ready state
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(null);
    
    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.videoFileUrls;
      delete newErrors.videoThumbnailUrl;
      return newErrors;
    });

    try {
      // Use the new method that automatically waits for completion
      const finalResponse = await VideoService.uploadVideoAndWaitForCompletion({
        file,
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        },
        maxWaitTime: 300000 // 5 minutes
      });

      console.log('Upload completed successfully:', finalResponse);

      // Automatically populate form data with the final URLs
      if (finalResponse.status === 'Completed' && finalResponse.videoUrl && finalResponse.thumbnailUrl) {
        setFormData(prev => ({
          ...prev,
          videoFileUrls: [finalResponse.videoUrl!],
          videoThumbnailUrl: finalResponse.thumbnailUrl!,
          duration: finalResponse.duration || prev.duration
        }));

        // Show success message
        console.log('✅ Form is now ready to submit with:');
        console.log('📹 Video URL:', finalResponse.videoUrl);
        console.log('🖼️ Thumbnail URL:', finalResponse.thumbnailUrl);
        console.log('⏱️ Duration:', finalResponse.duration);

        // Mark form as ready to submit
        setIsFormReady(true);
        
        // Optional: Show user notification that form is ready
        setUploadProgress(prev => prev ? {
          ...prev,
          message: 'تم الرفع بنجاح! النموذج جاهز للإرسال الآن ✅'
        } : null);
      } else {
        throw new Error('Upload completed but video URLs are missing');
      }

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setErrors(prev => ({
        ...prev,
        videoFileUrls: errorMessage
      }));

      setUploadProgress({
        uploadId: 'error',
        progress: 0,
        status: 'Failed',
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t('video.createNew')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('video.title')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('video.titlePlaceholder')}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('video.language')}
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value as 'English' | 'Arabic')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Arabic">{t('language.arabic')}</option>
              <option value="English">{t('language.english')}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('video.content')} *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('video.contentPlaceholder')}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        {/* Video Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('video.type')}
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="videoType"
                value="external"
                checked={videoType === 'external'}
                onChange={() => handleVideoTypeChange('external')}
                className="mr-2"
              />
              {t('video.externalVideo')}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="videoType"
                value="upload"
                checked={videoType === 'upload'}
                onChange={() => handleVideoTypeChange('upload')}
                className="mr-2"
              />
              {t('video.uploadVideo')}
            </label>
          </div>
        </div>

        {/* External Video Fields */}
        {videoType === 'external' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('video.url')}
              </label>
              <input
                type="url"
                value={formData.videoUrl || ''}
                onChange={(e) => handleInputChange('videoUrl', e.target.value || null)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://youtube.com/watch?v=..."
              />
              {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('video.embedCode')} *
              </label>
              <textarea
                value={formData.videoEmbedCode || ''}
                onChange={(e) => handleInputChange('videoEmbedCode', e.target.value || null)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.videoEmbedCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='<iframe src="..." width="560" height="315"></iframe>'
              />
              {errors.videoEmbedCode && <p className="text-red-500 text-sm mt-1">{errors.videoEmbedCode}</p>}
              <p className="text-sm text-gray-500 mt-1">
                {t('video.embedCodeHelp')}
              </p>
            </div>
          </div>
        )}

        {/* Upload Video Fields */}
        {videoType === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('video.uploadFiles')} *
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            />
            {errors.videoFileUrls && <p className="text-red-500 text-sm mt-1">{errors.videoFileUrls}</p>}
            
            {/* Upload Progress */}
            {uploadProgress && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {uploadProgress.status === 'Uploading' && 'جاري الرفع...'}
                    {uploadProgress.status === 'Processing' && 'جاري المعالجة...'}
                    {uploadProgress.status === 'Completed' && 'تم الرفع بنجاح'}
                    {uploadProgress.status === 'Failed' && 'فشل الرفع'}
                  </span>
                  <span className="text-sm text-gray-500">{uploadProgress.progress}%</span>
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
                <p className="text-sm text-gray-600 mt-2">{uploadProgress.message}</p>
                
                {/* Show thumbnail when available */}
                {uploadProgress.thumbnailUrl && (
                  <div className="mt-3">
                    <img 
                      src={uploadProgress.thumbnailUrl} 
                      alt="Video thumbnail" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Selected File Info */}
            {selectedFile && !uploadProgress && (
              <div className="mt-2 text-sm text-gray-600">
                <p>الملف المحدد: {selectedFile.name}</p>
                <p>الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('video.thumbnail')} *
          </label>
          <input
            type="url"
            value={formData.videoThumbnailUrl}
            onChange={(e) => handleInputChange('videoThumbnailUrl', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.videoThumbnailUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com/thumbnail.jpg"
          />
          {errors.videoThumbnailUrl && <p className="text-red-500 text-sm mt-1">{errors.videoThumbnailUrl}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('video.duration')}
          </label>
          <input
            type="text"
            value={formData.duration || ''}
            onChange={(e) => handleInputChange('duration', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00:05:30"
            pattern="^-?(\d+\.)?\d{2}:\d{2}:\d{2}(\.\d{1,7})?$"
          />
          <p className="text-sm text-gray-500 mt-1">
            {t('video.durationFormat')}
          </p>
        </div>

        {/* Visibility Options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { key: 'addToSlider', label: t('video.addToSlider') },
            { key: 'addToFeatured', label: t('video.addToFeatured') },
            { key: 'addToBreaking', label: t('video.addToBreaking') },
            { key: 'addToRecommended', label: t('video.addToRecommended') },
            { key: 'visibility', label: t('video.visible') },
            { key: 'showOnlyToRegisteredUsers', label: t('video.registeredOnly') }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={formData[key as keyof VideoFormData] as boolean}
                onChange={(e) => handleInputChange(key as keyof VideoFormData, e.target.checked)}
                className="mr-2"
              />
              {label}
            </label>
          ))}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('video.status')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as 'Draft' | 'Scheduled' | 'Published')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Draft">{t('status.draft')}</option>
            <option value="Scheduled">{t('status.scheduled')}</option>
            <option value="Published">{t('status.published')}</option>
          </select>
        </div>

        {/* Form Ready Indicator */}
        {videoType === 'upload' && isFormReady && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ✅ الفيديو جاهز! تم الحصول على الروابط تلقائياً
                </p>
                <p className="text-sm text-green-700 mt-1">
                  يمكنك الآن إرسال النموذج لإنشاء المنشور
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isUploading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
              isFormReady && videoType === 'upload' 
                ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={isLoading || isUploading || (videoType === 'upload' && !isFormReady)}
          >
            {isLoading ? t('common.creating') : 
             isUploading ? 'جاري الرفع...' :
             isFormReady && videoType === 'upload' ? '✅ إنشاء الفيديو' :
             t('video.create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoCreationForm;
