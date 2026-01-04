# File Upload Modal Migration Guide

## Overview

The old `FileFormModal` has been replaced with a new `FileUploadModal` that implements a comprehensive two-step workflow for uploading files.

## What Changed

### Old Modal (`FileFormModal`)
- Single-step form with all fields at once
- Required manual entry of file metadata
- No document selection - only document ID field
- No file upload capability - just metadata entry

### New Modal (`FileUploadModal`)
- **Two-step guided workflow**
- **Step 1: Document Selection**
  - Option A: Select from existing documents (with preview)
  - Option B: Create new document (with form)
- **Step 2: File Source**
  - Option A: Upload new file from device
  - Option B: Select from unattached files in n8n

## Migration

### Files Page (`/app/files/page.tsx`)

**Before:**
```tsx
import { FileFormModal, FileFormData } from '@/components/files/FileFormModal';

const handleCreateFile = async (formData: FileFormData) => {
  setIsSubmitting(true);
  try {
    await filesApi.create({
      object_type_id: fileObjectTypeId,
      object_status_id: defaultStatusId,
      filename: formData.filename,
      // ... many fields
      parent_document_id: formData.parent_document_id,
    });
    setIsModalOpen(false);
    await loadFiles();
  } catch (err) {
    // error handling
  } finally {
    setIsSubmitting(false);
  }
};

<FileFormModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleCreateFile}
  isSubmitting={isSubmitting}
/>
```

**After:**
```tsx
import { FileUploadModal } from '@/components/files/FileUploadModal';

const handleFileUpload = async (documentId: number, fileId: number) => {
  console.log('File uploaded successfully:', { documentId, fileId });
  setIsModalOpen(false);
  await loadFiles();
};

<FileUploadModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleFileUpload}
  isSubmitting={isSubmitting}
  objectTypeId={11} // File object type ID
  objectStatusId={1} // Default active status
/>
```

## Benefits

### User Experience
✅ **Guided workflow** - Users are guided through document selection and file upload steps
✅ **Less manual entry** - Select from existing documents instead of entering IDs
✅ **Visual previews** - See document details before linking
✅ **File upload** - Actually upload files, not just metadata
✅ **Reuse existing files** - Can link already uploaded files from n8n

### Developer Experience
✅ **Simpler integration** - Just 2 parameters in callback (documentId, fileId)
✅ **Less validation** - Modal handles all validation internally
✅ **Better error handling** - Built-in error states and messages
✅ **Type-safe** - Full TypeScript support

### Business Logic
✅ **Documents first** - Ensures files always have a parent document
✅ **Reusability** - Can reuse unattached files across documents
✅ **Flexibility** - Upload new or use existing files

## New API Endpoints Required

The new modal uses two additional API endpoints that need to be implemented in n8n:

### 1. Get Unattached Files
```
GET /files/unattached
```
Returns files that are not linked to any document.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "filename": "contract.pdf",
      "original_filename": "Contract Agreement 2024.pdf",
      "file_path": "/storage/documents/2024/contract.pdf",
      "mime_type": "application/pdf",
      "file_size": 245678,
      "is_active": true
    }
  ]
}
```

### 2. Upload Physical File
```
POST /files/upload
Content-Type: multipart/form-data
```
Uploads a file to n8n storage.

**Request:**
```
FormData {
  file: File (binary)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "filename": "invoice_2024.pdf",
    "original_filename": "Invoice 2024-001.pdf",
    "file_path": "/storage/uploads/2024/invoice_2024.pdf",
    "mime_type": "application/pdf",
    "file_size": 156789,
    "checksum": "sha256:a3d5f6e7...",
    "storage_type": "local",
    "is_active": true
  }
}
```

## Backward Compatibility

The old `FileFormModal` is still available for backward compatibility:

```tsx
import { FileFormModal } from '@/components/files/FileFormModal';
// or
import { FileFormModal } from '@/components/files';
```

However, we recommend migrating to `FileUploadModal` for the improved user experience.

## Testing Checklist

- [ ] Can select existing document
- [ ] Can create new document with all fields
- [ ] Can upload new file from device
- [ ] Can select existing unattached file
- [ ] File is correctly linked to document after upload
- [ ] Error messages display correctly
- [ ] Can navigate back through steps
- [ ] Modal closes properly on cancel
- [ ] Loading states work correctly
- [ ] All translations display correctly (EN, DE, HU)

## Support

For questions or issues, please refer to:
- Component: `/frontend/src/components/files/FileUploadModal.tsx`
- API: `/frontend/src/lib/api/files.ts`
- Translations: `/frontend/src/lib/i18n/translations/{en,de,hu}.ts`
