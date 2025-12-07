import { useState } from "react";
import { reelsApi } from "../api";
import type { MediaUploadStatusResponse } from "../api";

/**
 * Example component demonstrating the complete reels creation workflow
 * 
 * Workflow:
 * 1. Upload video file → get uploadId
 * 2. Poll upload status → get videoUrl when completed
 * 3. (Optional) Upload thumbnail image → get thumbnailUrl
 * 4. Create reel with obtained URLs + caption + tags
 */
export default function ReelsUsageExample() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
    const [createdReelId, setCreatedReelId] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Method 1: Manual approach with full control
    const handleManualUpload = async () => {
        if (!videoFile) {
            setError("Please select a video file");
            return;
        }

        setLoading(true);
        setError("");
        setUploadProgress("Starting upload...");

        try {
            // Step 1: Upload video
            const uploadResponse = await reelsApi.uploadVideo(videoFile);
            setUploadProgress(`Upload started. ID: ${uploadResponse.uploadId}`);

            // Step 2: Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const status = await reelsApi.getUploadStatus(uploadResponse.uploadId);
                    setUploadProgress(
                        `Status: ${status.status} - Progress: ${status.progressPercentage}%`
                    );

                    if (status.status === "Completed") {
                        clearInterval(pollInterval);
                        setVideoUrl(status.url);
                        setUploadProgress("Video processing complete!");

                        // Optional: Upload thumbnail
                        if (thumbnailFile) {
                            await uploadThumbnail();
                        }
                    } else if (status.status === "Failed") {
                        clearInterval(pollInterval);
                        setError("Video processing failed");
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError(`Polling error: ${err}`);
                }
            }, 3000); // Poll every 3 seconds
        } catch (err) {
            setError(`Upload error: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    // Method 2: Automatic approach (recommended)
    const handleAutoUpload = async () => {
        if (!videoFile) {
            setError("Please select a video file");
            return;
        }

        setLoading(true);
        setError("");
        setUploadProgress("Starting upload and waiting for completion...");

        try {
            // Upload video and wait for completion automatically
            const videoStatus = await reelsApi.uploadVideoAndWait(videoFile);
            setVideoUrl(videoStatus.url);
            setUploadProgress("Video upload complete!");

            // Optional: Upload thumbnail if provided
            let finalThumbnailUrl = "";
            if (thumbnailFile) {
                setUploadProgress("Uploading thumbnail...");
                const thumbnailStatus = await reelsApi.uploadImageAndWait(thumbnailFile);
                setThumbnailUrl(thumbnailStatus.url);
                finalThumbnailUrl = thumbnailStatus.url;
                setUploadProgress("Thumbnail upload complete!");
            }

            // Step 3: Create the reel
            setUploadProgress("Creating reel...");
            const reel = await reelsApi.create({
                videoUrl: videoStatus.url,
                thumbnailUrl: finalThumbnailUrl || null,
                caption: caption || "My awesome reel",
                tags: tags.length > 0 ? tags : ["sample", "test"],
            });

            setCreatedReelId(reel.id);
            setUploadProgress("Reel created successfully!");
        } catch (err) {
            setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadThumbnail = async () => {
        if (!thumbnailFile) return;

        try {
            const thumbnailStatus = await reelsApi.uploadImageAndWait(thumbnailFile);
            setThumbnailUrl(thumbnailStatus.url);
        } catch (err) {
            setError(`Thumbnail upload error: ${err}`);
        }
    };

    // Method 3: Complete workflow with progress tracking
    const handleCompleteWorkflow = async () => {
        if (!videoFile) {
            setError("Please select a video file");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Upload video
            setUploadProgress("Uploading video (1/4)...");
            const videoUpload = await reelsApi.uploadVideo(videoFile);

            // Wait for processing
            setUploadProgress("Processing video (2/4)...");
            const videoStatus = await reelsApi.waitForProcessingComplete(videoUpload.uploadId);
            setVideoUrl(videoStatus.url);

            // Upload thumbnail (optional)
            let finalThumbnailUrl = "";
            if (thumbnailFile) {
                setUploadProgress("Uploading thumbnail (3/4)...");
                const thumbUpload = await reelsApi.uploadImage(thumbnailFile);
                const thumbStatus = await reelsApi.waitForProcessingComplete(thumbUpload.uploadId);
                setThumbnailUrl(thumbStatus.url);
                finalThumbnailUrl = thumbStatus.url;
            }

            // Create reel
            setUploadProgress("Creating reel (4/4)...");
            const reel = await reelsApi.create({
                videoUrl: videoStatus.url,
                thumbnailUrl: finalThumbnailUrl || null,
                caption: caption || "Sample reel caption",
                tags: tags.length > 0 ? tags : ["test"],
            });

            setCreatedReelId(reel.id);
            setUploadProgress("✅ Reel created successfully!");

            // Optional: Publish immediately
            // await reelsApi.publish(reel.id);
        } catch (err) {
            setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Create Reel Example</h2>

            {/* Video Upload */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Video File (Max 500MB, MP4/AVI/MOV/WebM)
                </label>
                <input
                    type="file"
                    accept="video/mp4,video/avi,video/quicktime,video/webm"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Thumbnail Upload */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Thumbnail (Optional, Max 10MB)
                </label>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Caption */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Caption</label>
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter reel caption..."
                    className="w-full p-2 border rounded"
                    rows={3}
                />
            </div>

            {/* Tags */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                    Tags (comma-separated)
                </label>
                <input
                    type="text"
                    value={tags.join(", ")}
                    onChange={(e) =>
                        setTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
                    }
                    placeholder="tag1, tag2, tag3"
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-6">
                <button
                    onClick={handleAutoUpload}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Processing..." : "Upload & Create Reel (Auto)"}
                </button>

                <button
                    onClick={handleCompleteWorkflow}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                    {loading ? "Processing..." : "Complete Workflow (Step by Step)"}
                </button>

                <button
                    onClick={handleManualUpload}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                    {loading ? "Processing..." : "Manual Upload (Advanced)"}
                </button>
            </div>

            {/* Progress Display */}
            {uploadProgress && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">{uploadProgress}</p>
                </div>
            )}

            {/* URLs Display */}
            {videoUrl && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-800">Video URL:</p>
                    <p className="text-xs text-green-700 break-all">{videoUrl}</p>
                </div>
            )}

            {thumbnailUrl && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-800">Thumbnail URL:</p>
                    <p className="text-xs text-green-700 break-all">{thumbnailUrl}</p>
                </div>
            )}

            {/* Success Display */}
            {createdReelId && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded">
                    <p className="text-sm font-medium text-green-900">
                        ✅ Reel Created! ID: {createdReelId}
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* API Usage Documentation */}
            <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-semibold mb-2">API Usage Examples:</h3>
                <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
                    {`// Example 1: Simple auto-upload
const videoStatus = await reelsApi.uploadVideoAndWait(videoFile);
const reel = await reelsApi.create({
  videoUrl: videoStatus.url,
  caption: "My reel",
  tags: ["tag1", "tag2"]
});

// Example 2: With thumbnail
const videoStatus = await reelsApi.uploadVideoAndWait(videoFile);
const thumbStatus = await reelsApi.uploadImageAndWait(thumbnailFile);
const reel = await reelsApi.create({
  videoUrl: videoStatus.url,
  thumbnailUrl: thumbStatus.url,
  caption: "My reel"
});

// Example 3: Manual control
const upload = await reelsApi.uploadVideo(videoFile);
const status = await reelsApi.waitForProcessingComplete(upload.uploadId);
const reel = await reelsApi.create({ videoUrl: status.url });

// Example 4: Publish after creation
const reel = await reelsApi.create({ videoUrl: "..." });
await reelsApi.publish(reel.id);

// Example 5: List reels
const reels = await reelsApi.getAll({
  pageNumber: 1,
  pageSize: 10,
  isPublished: true
});`}
                </pre>
            </div>
        </div>
    );
}
