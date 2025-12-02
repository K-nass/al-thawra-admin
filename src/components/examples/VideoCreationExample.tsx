import React, { useState } from 'react';
import VideoCreationForm from '../forms/VideoCreationForm';
import { VideoService } from '../../api/videoService';
import type { VideoCreateRequest } from '../../types/video';

const VideoCreationExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Example category ID - replace with actual category ID
  const categoryId = '20422779-69b1-4d49-a404-43c1869a9728';

  const handleVideoSubmit = async (formData: VideoCreateRequest) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Create the video using the API service
      const createdVideo = await VideoService.createVideo(categoryId, formData);
      
      setMessage({
        type: 'success',
        text: `Video "${createdVideo.title}" created successfully!`
      });
      
      setShowForm(false);
      
      // Optional: Redirect or refresh data
      console.log('Created video:', createdVideo);
      
    } catch (error) {
      console.error('Error creating video:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create video'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setMessage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          إدارة الفيديوهات
        </h1>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        {!showForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              إنشاء فيديو جديد
            </button>
          </div>
        )}

        {/* Video Creation Form */}
        {showForm && (
          <VideoCreationForm
            categoryId={categoryId}
            onSubmit={handleVideoSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {/* API Usage Examples */}
        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            أمثلة على استخدام API
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">1. إنشاء فيديو خارجي (YouTube/Vimeo):</h3>
              <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
{`const videoData = {
  title: "عنوان الفيديو",
  content: "وصف الفيديو",
  videoUrl: "https://youtube.com/watch?v=VIDEO_ID",
  videoEmbedCode: "<iframe src='...' width='560' height='315'></iframe>",
  videoThumbnailUrl: "https://example.com/thumbnail.jpg",
  categoryId: "${categoryId}",
  language: "Arabic",
  visibility: true,
  addToSlider: false,
  addToFeatured: true,
  addToBreaking: false,
  addToRecommended: true,
  showOnlyToRegisteredUsers: false,
  tagIds: [],
  videoFileUrls: [],
  status: "Published"
};

const video = await VideoService.createVideo(categoryId, videoData);`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">2. إنشاء فيديو مرفوع:</h3>
              <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
{`const videoData = {
  title: "فيديو مرفوع",
  content: "وصف الفيديو المرفوع",
  videoUrl: null,
  videoEmbedCode: null,
  videoFileUrls: ["https://cdn.example.com/video1.mp4"],
  videoThumbnailUrl: "https://example.com/thumbnail.jpg",
  categoryId: "${categoryId}",
  language: "Arabic",
  // ... other fields
};`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">3. توليد كود التضمين تلقائياً:</h3>
              <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
{`const embedCode = VideoService.generateEmbedCode(
  "https://youtube.com/watch?v=dQw4w9WgXcQ"
);
// Returns: <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Common Validation Errors */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            أخطاء التحقق الشائعة
          </h2>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <strong>Video embed code is required when using an external video URL:</strong> 
              يجب توفير كود التضمين عند استخدام رابط فيديو خارجي
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <strong>Title is required:</strong> العنوان مطلوب
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <strong>Content is required:</strong> المحتوى مطلوب
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <strong>Video thumbnail URL is required:</strong> رابط صورة الفيديو المصغرة مطلوب
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoCreationExample;
