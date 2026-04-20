# Bugfix Requirements Document

## Introduction

This document addresses validation errors that occur when updating posts (articles, videos, or audios) in the DashboardEditPost component. The API returns a 422 validation error due to two issues: a missing "command" field and an invalid authorId value (null) that causes a GUID conversion error. This prevents users from successfully updating any post content.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user attempts to update a post (article/video/audio) THEN the system sends a payload with `authorId: null` which causes a GUID conversion error

1.2 WHEN a user attempts to update a post (article/video/audio) THEN the system fails to include the required "command" field in the payload

1.3 WHEN the API receives the update request THEN the system returns a 422 validation error with messages: "The command field is required" and "The JSON value could not be converted to System.Guid"

### Expected Behavior (Correct)

2.1 WHEN a user attempts to update a post (article/video/audio) THEN the system SHALL include the required "command" field in the payload

2.2 WHEN a user attempts to update a post (article/video/audio) AND authorId is null THEN the system SHALL omit the authorId field from the payload entirely (rather than sending null)

2.3 WHEN the API receives a properly formatted update request THEN the system SHALL successfully update the post without validation errors

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user updates a post with valid data THEN the system SHALL CONTINUE TO map frontend field names to API field names correctly (addToBreaking → isBreaking, addToFeatured → isFeatured, etc.)

3.2 WHEN a user updates a post THEN the system SHALL CONTINUE TO remove read-only fields from the payload (id, createdAt, updatedAt, etc.)

3.3 WHEN a user updates a post THEN the system SHALL CONTINUE TO include the appropriate post type ID field (articleId, videoId, or audioId)

3.4 WHEN a user updates a post THEN the system SHALL CONTINUE TO handle type-specific field mappings (imageUrl → videoThumbnailUrl for videos, imageUrl → thumbnailUrl for audios)

3.5 WHEN a user updates a post THEN the system SHALL CONTINUE TO navigate to the posts list page after successful update

3.6 WHEN a user updates a post and receives a 401 error THEN the system SHALL CONTINUE TO redirect to the login page
