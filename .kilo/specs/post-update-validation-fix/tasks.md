# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Update Payload Missing Required Fields
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: update requests with missing "command" field or authorId: null
  - Test that update requests with missing "command" field or authorId: null cause 422 validation errors (from Bug Condition in design)
  - The test assertions should match the Expected Behavior Properties from design: payload must include "command" field and omit authorId when null
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "Update request returns 422: 'The command field is required'", "Update request returns 422: 'The JSON value could not be converted to System.Guid'")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [~] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Payload Transformations
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for field mappings (addToBreaking → isBreaking, addToFeatured → isFeatured, addToSlider → isSlider, addToRecommended → isRecommended, summary → description, optionalURL → optionalUrl)
  - Observe behavior on UNFIXED code for cleanup operations (removal of read-only fields: id, createdAt, updatedAt, etc.)
  - Observe behavior on UNFIXED code for type-specific mappings (imageUrl → videoThumbnailUrl for videos, imageUrl → thumbnailUrl for audios)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix for post update validation errors

  - [~] 3.1 Implement the fix in DashboardEditPost.tsx
    - Add "command" field to the payload with appropriate value for each post type
    - Research API documentation or backend code to determine correct command value (likely "UpdateArticle", "UpdateVideo", "UpdateAudio")
    - Replace `payload.authorId = null;` with conditional logic to omit authorId when null: `if (payload.authorId === null || payload.authorId === undefined) delete payload.authorId;`
    - Verify payload structure matches API's expected structure
    - Add console logging for debugging: `console.log('Update payload:', payload);`
    - Update comment from "System preference" to "Omit authorId when null to avoid GUID conversion error"
    - _Bug_Condition: isBugCondition(input) where (input.command === undefined OR input.command === null) OR (input.authorId === null)_
    - _Expected_Behavior: payload includes required "command" field AND authorId is omitted when null (not sent as null)_
    - _Preservation: All existing field mappings, cleanup operations, type-specific transformations, and navigation/error handling must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [~] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Update Payload Includes Required Fields
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [~] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Payload Transformations
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [~] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
