# Unified Object Relations System - Design Document

**Date:** 2026-01-09
**Status:** Design Complete - Ready for Implementation

## Overview

A comprehensive object relations system that enables users to view, manage, and analyze relationships between all entities in the Office Application. The system consists of two main components:

1. **Entity Relations Tabs** - Contextual relation views on each entity page with quick action shortcuts
2. **Relations Manager Page** - System-wide relation management with data quality checks and bulk operations

## Key Features

- Contextual relation display showing relationships from the current entity's perspective
- Direct navigation to related entities by clicking on them
- Smart filtering of relation types based on object type constraints
- Inline relation creation with advanced object search
- Quick action modals for creating related entities without leaving the page
- Comprehensive data quality detection (orphaned, duplicates, invalid, missing mirrors)
- Bulk operations for efficient data maintenance

## Database Schema

### Existing Tables (No Changes Required)

**objects** - Central entity table with shared primary keys
- `id` - Primary key shared with entity tables
- `object_type_id` - Type of object (person, company, invoice, etc.)
- `object_status_id` - Status of the object

**object_relations** - Links any object to any other object
- `id` - Primary key
- `object_from_id` - Source object (FK to objects.id)
- `object_to_id` - Target object (FK to objects.id)
- `object_relation_type_id` - Type of relationship (FK to object_relation_types.id)
- `note` - Optional note about the relationship
- `is_active` - Soft delete flag
- `created_at`, `updated_at` - Timestamps
- `created_by` - User who created the relation

**object_relation_types** - Defines valid relationship types
- `id` - Primary key
- `code` - Relation type code (references translations)
- `parent_object_type_id` - Parent object type constraint
- `child_object_type_id` - Child object type constraint
- `mirrored_type_id` - Inverse relation type ID
- `is_active` - Soft delete flag

## API Endpoints

### New Endpoints Required

#### Data Quality Endpoints
- `POST /api/v1/relations/data-quality/orphaned` - Find relations pointing to inactive objects
- `POST /api/v1/relations/data-quality/duplicates` - Find duplicate relations
- `POST /api/v1/relations/data-quality/invalid` - Find relations violating type constraints
- `POST /api/v1/relations/data-quality/missing-mirrors` - Find relations missing inverse counterparts

#### Bulk Operations Endpoints
- `POST /api/v1/relations/bulk/delete` - Delete multiple relations
  - Body: `{relation_ids: [1,2,3]}`

- `POST /api/v1/relations/bulk/reassign` - Reassign target object
  - Body: `{relation_ids: [1,2,3], old_object_to_id: 100, new_object_to_id: 123}`

- `POST /api/v1/relations/bulk/update-type` - Change relation type
  - Body: `{relation_ids: [1,2,3], old_relation_type_id: 2, new_relation_type_id: 5}`

#### Universal Object Search
- `POST /api/v1/objects/search` - Universal object search with filtering
  - Body: `{query: "search text", object_type_ids: [1,2], object_status_ids: [1], page: 1, per_page: 20}`

### Updated Existing Endpoints (Use POST Method)
- `GET /api/v1/objects/{id}/relations` - Get all relations for an object
- `POST /api/v1/object-relations` - Create new relation
  - Body: `{object_from_id: 10, object_to_id: 20, object_relation_type_id: 1, note: "text"}`
- `POST /api/v1/object-relations/{id}` - Update relation (note field only)
  - Body: `{note_old: "old text", note_new: "new text"}`
- `POST /api/v1/object-relations/{id}/delete` - Soft delete relation
  - Body: `{id: 123}`

## Component Architecture

### New Components

#### Core Relation Components
**ObjectRelationsTable.tsx**
- Reusable table component showing relations for any object
- Props: `objectId`, `objectTypeId`, `onRelationClick`, `showQuickActions`
- Features: contextual display, inline note editing, delete action, add relation button
- Follows existing patterns from AddressesTable, ContactsTable, NotesTable

**AddRelationModal.tsx**
- Modal for creating new relations
- Smart filtering: only shows valid relation types for current object
- Advanced search button to find target objects
- Form fields: relation type selector, target object selector, note textarea

**AdvancedObjectSearchModal.tsx**
- Reusable search modal for finding any object
- Filters: object types (multi-select), object statuses, search query
- Results table with pagination
- Returns selected object to parent component

#### Quick Action Components
**QuickActionButton.tsx**
- Smart button that determines available actions based on context
- Props: `currentObjectId`, `currentObjectTypeId`, `onSuccess`
- Renders action buttons like "Create Invoice", "Add Document", "Link Person"

**CreateRelatedEntityModal.tsx**
- Generic modal for creating related entities
- Props: `entityType`, `prefilledData`, `onSuccess`
- Dynamically loads appropriate form based on entity type
- Auto-creates relation after entity creation
- Shows success message with options: "View New Entity" or "Close and Continue"

#### Relation Manager Components
**RelationsManagerPage.tsx**
- Main page component at `/relations`
- Summary cards showing data quality issue counts
- Tabbed interface for different views

**DataQualityTab.tsx**
- Shows data quality issues with filtering
- Tabs: All Relations, Orphaned, Duplicates, Invalid, Missing Mirrors

**BulkOperationsToolbar.tsx**
- Toolbar for bulk actions when rows selected
- Shows selected count and action buttons
- Confirmation dialogs for destructive actions

**RelationStatsCards.tsx**
- Summary cards showing counts by issue type
- Cards: Orphaned, Duplicates, Invalid, Missing Mirrors

### Component File Structure
```
frontend/src/components/
├── relations/
│   ├── ObjectRelationsTable.tsx
│   ├── AddRelationModal.tsx
│   ├── QuickActionButton.tsx
│   └── CreateRelatedEntityModal.tsx
├── search/
│   └── AdvancedObjectSearchModal.tsx
└── relations-manager/
    ├── RelationsManagerPage.tsx
    ├── DataQualityTab.tsx
    ├── BulkOperationsToolbar.tsx
    └── RelationStatsCards.tsx
```

## Entity Relations Tab Implementation

### Integration Pattern

Add "Relations" tab to existing entity pages (persons, companies, invoices, etc.) alongside existing tabs like Contacts, Addresses, Notes, Documents, Audits.

Example Integration (Persons Page):
```tsx
<Tabs>
  <Tab label="Details">...</Tab>
  <Tab label="Contacts">...</Tab>
  <Tab label="Addresses">...</Tab>
  <Tab label="Relations">
    <ObjectRelationsTable
      objectId={personId}
      objectTypeId={1} // person type
      showQuickActions={true}
    />
  </Tab>
  <Tab label="Audits">...</Tab>
</Tabs>
```

### ObjectRelationsTable Features

**Table Columns:**
- Relation Type (e.g., "employed_by", "related_to")
- Target Object (clickable link showing type icon + name)
- Note (inline editable textarea)
- Created At (formatted timestamp)
- Actions (Edit Note, Delete buttons)

**Contextual Display:**
- Shows relations FROM current object (object_from_id = current)
- Shows relations TO current object (object_to_id = current)
- Displays direction with subtle indicator: "→" for outgoing, "←" for incoming
- Format: "employed_by → Acme Corp" (current object implied as source)

**Quick Actions Toolbar:**
- Positioned above the relations table
- Dynamically generated based on valid relation types for current object
- Examples: "Create Invoice", "Link Document", "Add Related Person"
- Each button opens `CreateRelatedEntityModal` with pre-filled relation data
- Opens inline modal, shows success with "View New Entity" or "Close and Continue" options

**Add Relation Button:**
- "Add Relation" button opens `AddRelationModal`
- Modal shows relation type dropdown (filtered by current object type)
- "Select Object" button opens `AdvancedObjectSearchModal`
- Note field for additional context

## Relations Manager Page

### Page Layout

**Top Section - Summary Cards (4 cards in a row):**
- Orphaned Relations (count + warning icon)
- Duplicate Relations (count + alert icon)
- Invalid Relations (count + error icon)
- Missing Mirrors (count + info icon)

**Main Section - Tabbed Interface:**
1. All Relations Tab - Browse/search all relations in the system
2. Orphaned Tab - Relations pointing to inactive/deleted objects
3. Duplicates Tab - Same from+to+type combinations
4. Invalid Tab - Relations violating type constraints
5. Missing Mirrors Tab - Relations without inverse counterparts

### Data Quality Detection Logic

**1. Orphaned Relations:**
- Query: JOIN with objects table, find where `objects.is_active = false`
- Show: relation details + which object is inactive
- Action: Bulk delete or manually review

**2. Duplicate Relations:**
- Query: GROUP BY object_from_id, object_to_id, object_relation_type_id HAVING COUNT(*) > 1
- Show: grouped duplicates with creation dates
- Action: Keep newest, delete older duplicates

**3. Invalid Relations:**
- Query: JOIN with object_relation_types, check if actual object types match parent/child constraints
- Example: Person→Company relation using "sibling_of" type (which expects Person→Person)
- Action: Change relation type or delete

**4. Missing Mirrors:**
- Query: Find relations where `object_relation_types.mirrored_type_id` is set but inverse relation doesn't exist
- Example: Person→Company "employed_by" exists, but Company→Person "has_employee" is missing
- Action: Auto-create missing mirrors or mark as intentional

### Bulk Operations Toolbar

- Appears when rows selected in any tab
- Shows selected count: "3 relations selected"
- Buttons: "Delete Selected", "Reassign Target", "Change Type", "Clear Selection"
- Confirmation dialogs for all destructive actions

## Implementation Considerations

### 1. Navigation Routing
Use Next.js `useRouter` to navigate when clicking related objects.

Route mapping by object_type_id:
- 1 (person) → `/persons?id={object_id}`
- 2 (company) → `/companies?id={object_id}`
- 3 (user) → `/users?id={object_id}`
- 4 (invoice) → `/invoices?id={object_id}`
- 5 (transaction) → `/transactions?id={object_id}`
- Documents → `/documents?id={object_id}`

### 2. Smart Filtering Logic
- Load all `object_relation_types` with parent/child constraints
- When viewing Person (object_type_id=1):
  - Filter relation types WHERE parent_object_type_id = 1
  - For each relation type, determine valid target object types from child_object_type_id
  - In search modal, filter objects by valid target types

### 3. Inline Editing Pattern
Follow existing pattern from NotesTable, AddressesTable:
- Store `originalData` and `editData` in component state
- On save, send both old and new values: `{note_old: "...", note_new: "..."}`
- Cancel restores original values

### 4. Language Handling
- Relation type names come from translations table (like other lookups)
- Use current language from languageStore
- Pass language_id to API calls via request body (automatic via interceptor)

### 5. Error Handling
- Validation: check if relation type allows current object → target object combination
- Duplicate prevention: check if relation already exists before creating
- Cascade awareness: warn user if deleting relation affects dependent data

### 6. Performance Considerations
- Paginate relations lists (20 per page default)
- Add loading states for all async operations
- Cache object_relation_types in lookupStore to avoid repeated fetches
- Debounce search queries in AdvancedObjectSearchModal

### 7. Sidebar Navigation
- Add "Relations Manager" link to sidebar under a new "System" or "Admin" section
- Icon: Link2 from lucide-react
- Protected route: only accessible to admin users (check role in authStore)

## User Workflows

### Creating a Relation
1. User navigates to Person page
2. Clicks "Relations" tab
3. Clicks "Add Relation" button
4. Modal opens with relation type dropdown (filtered to valid types for Person)
5. User selects "employed_by" relation type
6. User clicks "Select Object" button
7. Advanced search modal opens with filters
8. User searches for company, selects "Acme Corp"
9. User optionally adds note: "Software Engineer"
10. User clicks "Create Relation"
11. Modal closes, relations table refreshes showing new relation

### Using Quick Actions
1. User on Company page, "Relations" tab
2. Sees quick action buttons: "Create Invoice", "Link Document", "Add Related Person"
3. Clicks "Create Invoice"
4. Modal opens with invoice creation form, company pre-filled
5. User fills invoice details (amount, date, etc.)
6. Clicks "Create"
7. Success message shows with "View Invoice" and "Close" buttons
8. User clicks "View Invoice"
9. Navigates to invoice detail page

### Managing Data Quality
1. Admin user navigates to `/relations` page
2. Sees summary cards: 5 Orphaned, 12 Duplicates, 2 Invalid, 8 Missing Mirrors
3. Clicks on "Duplicates" tab
4. Sees list of duplicate relations grouped together
5. Selects 10 duplicate relations (keeping newest of each group)
6. Clicks "Delete Selected" in bulk toolbar
7. Confirmation dialog appears
8. Confirms deletion
9. Relations deleted, counts updated

## Next Steps

### Phase 1: Core Components (Backend + Frontend)
1. Create n8n workflows for new API endpoints
2. Create API client methods in `frontend/src/lib/api/objectRelations.ts`
3. Build `AdvancedObjectSearchModal` component
4. Build `ObjectRelationsTable` component
5. Build `AddRelationModal` component

### Phase 2: Entity Integration
1. Add Relations tab to Persons page
2. Add Relations tab to Companies page
3. Add Relations tab to Invoices page
4. Test relation creation and editing

### Phase 3: Quick Actions
1. Build `QuickActionButton` component
2. Build `CreateRelatedEntityModal` component
3. Integrate quick actions into entity Relations tabs
4. Test end-to-end workflows

### Phase 4: Relations Manager
1. Build data quality detection endpoints
2. Build bulk operations endpoints
3. Build `RelationsManagerPage` component
4. Build `DataQualityTab` component
5. Build `BulkOperationsToolbar` component
6. Add sidebar navigation link
7. Test data quality detection and bulk operations

## Success Criteria

- Users can view all relations for any entity in a single, clear table
- Users can create relations with smart type filtering
- Users can navigate to related entities with a single click
- Users can create related entities without leaving the current page
- Admins can identify and fix data quality issues efficiently
- Admins can perform bulk operations on relations safely
- All operations follow existing inline editing patterns
- System maintains referential integrity and audit trails
