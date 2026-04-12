# Cloudinary Media Upload Guide

This document serves as a reference for developers and AI agents to understand and implement media uploads in this project.

## 🏗️ Architecture: The 3-Step Signed Upload

To keep the application secure, we use **Signed Uploads**. This prevents exposing Cloudinary credentials in the frontend and ensures only authorized users can upload files.

### Step 1: Request Upload Signature
The frontend calls our backend to get authorization.
- **Endpoint**: `POST /api/v1/media/request-upload-signature`
- **Logic**: The backend generates a signature based on a timestamp and restricted parameters (folder, transformation, etc.).
- **Response**: Contains `uploadUrl`, `signature`, `apiKey`, `timestamp`, `publicId`, and `folder`.

### Step 2: Direct Upload to Cloudinary
The frontend uploads the file directly to Cloudinary using the parameters from Step 1.
- **Method**: `POST` to the `uploadUrl` provided by the backend.
- **Payload**: `FormData` containing the file and all signature parameters.
- **Benefit**: Large files don't pass through our backend server, saving bandwidth and memory.

### Step 3: Confirm Upload
After a successful upload, the frontend notifies our backend.
- **Endpoint**: `POST /api/v1/media/confirm-cloudinary-upload`
- **Logic**: The backend verifies the upload and creates a record in the `Media` table.
- **Response**: Returns the final `Media` object (including the `secureUrl`).

---

## 🛠️ Implementation: `useCloudinaryUpload`

The `useCloudinaryUpload` hook encapsulates all three steps into a single, easy-to-use function.

### Basic Usage
```tsx
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

function MyComponent() {
  const { upload, isUploading, progress, status, message } = useCloudinaryUpload();

  const handleFileChange = async (file: File) => {
    const result = await upload(file);
    if (result) {
      console.log("Uploaded successfully:", result.url);
    }
  };
}
```

---

## 🎵 Example: Adding a New Media Type (e.g., Audio)

To support a new media type like **Audio**, follow these steps:

### 1. Update the Hook Helper
In `src/hooks/useCloudinaryUpload.ts`, update the `deriveMediaType` function to recognize the new MIME type:

```typescript
function deriveMediaType(file: File): string {
  if (file.type.startsWith("image/")) return "Image";
  if (file.type.startsWith("video/")) return "Video";
  if (file.type.startsWith("audio/")) return "Audio"; // Added support for audio
  if (file.type === "application/pdf") return "Magazine"; 
  return "Image";
}
```

### 2. Update the UI Logic (e.g., FileModal)
In `src/components/Admin/Dashboard/DashboardAddPost/DashboardForm/FileModal.tsx`, update the accepted formats and labels:

```tsx
const getAcceptedTypes = (): string => {
  switch (header) {
    case "audio":
      return "audio/mpeg,audio/wav,audio/ogg,audio/webm";
    // ...
  }
};

const getFormatLabel = (): string => {
  switch (header) {
    case "audio":
      return "MP3, WAV, OGG";
    // ...
  }
};
```

---

## 🚦 State Management
The hook provides the following states to track the upload progress:

| State | Description |
| :--- | :--- |
| `status` | `idle` \| `requesting-signature` \| `uploading` \| `confirming` \| `success` \| `error` |
| `progress` | Number (0-100) representing the upload percentage to Cloudinary. |
| `message` | Human-readable string for the current status. |
| `error` | Error message if the upload fails. |
| `result` | The final Media object returned from the backend. |

---

## 📄 Key Files
- **Logic**: [src/api/media.api.ts](file:///home/karim/Downloads/Projects/al-thawra-admin/src/api/media.api.ts)
- **Hook**: [src/hooks/useCloudinaryUpload.ts](file:///home/karim/Downloads/Projects/al-thawra-admin/src/hooks/useCloudinaryUpload.ts)
- **UI Example**: [src/components/Admin/Dashboard/DashboardAddPost/DashboardForm/FileModal.tsx](file:///home/karim/Downloads/Projects/al-thawra-admin/src/components/Admin/Dashboard/DashboardAddPost/DashboardForm/FileModal.tsx)
