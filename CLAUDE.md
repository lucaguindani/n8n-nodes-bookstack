# CLAUDE.md - Project Knowledge Base for AI-Assisted Development

This file contains essential context for LLMs working on this project.
Read this first before making any changes.

---

## Project Overview

**n8n-nodes-bookstack** is a community n8n node that integrates with the BookStack API.
It provides CRUD operations for BookStack's content hierarchy and is designed to be
used both manually in n8n workflows and by AI agents via MCP (`usableAsTool: true`).

- **Version**: 1.4.0
- **License**: MIT
- **Runtime**: Node 20+, n8n 1.109+, BookStack 24.5+
- **Package Manager**: pnpm

---

## BookStack Content Hierarchy

```
Shelf (top-level container)
  └── Book (contains chapters and/or direct pages)
       ├── Chapter (groups related pages within a book)
       │    └── Page (content unit with HTML or Markdown body)
       └── Page (direct page without chapter)
```

- A **Shelf** holds multiple **Books** (many-to-many via book IDs)
- A **Book** contains **Chapters** and/or direct **Pages**
- A **Chapter** belongs to exactly one Book and contains **Pages**
- A **Page** belongs to either a Book or a Chapter (not both simultaneously)
- **Tags** can be applied to Books, Chapters, Pages, and Shelves

---

## Architecture & File Structure

```
credentials/
  BookstackApi.credentials.ts     # API auth (Token ID + Token Secret)

nodes/Bookstack/
  Bookstack.node.ts               # Main node class (all operation handlers)
  Bookstack.node.json             # Node metadata for n8n registry
  descriptions/
    ResourceProperty.ts           # Resource selector (dropdown)
    Book.description.ts           # Book CRUD field definitions
    Chapter.description.ts        # Chapter CRUD field definitions
    Page.description.ts           # Page CRUD field definitions
    Shelf.description.ts          # Shelf CRUD field definitions
    Attachment.description.ts     # Attachment CRUD (file/link)
    Image.description.ts          # Image gallery CRUD
    Global.description.ts         # Global Search + Audit Log
    ListOperations.ts             # Shared filtering/sorting/pagination
  types/
    BookstackTypes.ts             # Filter interface
  utils/
    BookstackApiHelpers.ts        # HTTP request functions + validation
```

---

## Key Design Patterns

### 1. Node Class Structure (`Bookstack.node.ts`)

The `Bookstack` class implements `INodeType` with:

- **`resourceEndpoints`**: Maps resource names to API paths
  - `book` -> `books`, `page` -> `pages`, `chapter` -> `chapters`,
    `shelf` -> `shelves`, `attachment` -> `attachments`, `image` -> `image-gallery`

- **`resourceFields`**: Lists writable fields per resource
  - `book`: name, description, tags, default_template_id
  - `page`: name, html, markdown, book_id, chapter_id, tags
  - `chapter`: name, description, book_id, tags
  - `shelf`: name, description, books, tags

- **`buildRequestBody()`**: Reads all fields for a resource, skips undefined/empty values.
  Converts tags from comma-separated string to `[{name: "tag"}]` array format.
  Converts shelf books from comma-separated string to integer array.

- **`generateFallbackName()`**: Auto-generates a name when not provided:
  - Pages: First HTML heading (h1-h6) -> first text content -> first markdown heading -> first line -> timestamp
  - Books/Chapters/Shelves: Description text (truncated to 255) -> timestamp
  - Fallback format: `{resource}-{ISO-timestamp}`

- **`validatePageCreation()`**: Ensures pages have either book_id or chapter_id, and either html or markdown.

### 2. Operation Flow

```
execute() -> for each item:
  1. Read resource + operation from parameters
  2. Route to handler:
     - book/page/shelf/chapter: handleCreateOperation / handleGetOperation / etc.
     - attachment: handleCreateAttachmentOperation (multipart)
     - image: handleCreateImageOperation (multipart)
     - global: handleSearchOperation / handleAuditLogOperation
  3. Handler builds request body, validates, calls API
  4. Response mapped to INodeExecutionData
```

### 3. Description Files Pattern

Each resource has two exports:
- `{resource}Operations`: Operation dropdown (Create/Delete/Get/GetMany/Update)
- `{resource}Fields`: Parameter definitions with `displayOptions` controlling visibility

**Important for AI/MCP**: The `action` string on each operation option becomes the tool
action description. The `description` string on each field is what AI agents read to
understand parameters. Both should be clear and actionable.

### 4. Optional vs Required Fields

- Fields with `required: true` become mandatory MCP tool parameters (AI must provide them)
- Fields without `required` are optional - AI can skip them
- The `default: ''` value is for UI initialization only; `getNodeParameter()` with
  fallback `undefined` returns `undefined` when the user/AI doesn't provide a value
- `buildRequestBody()` skips fields where `value === undefined || value === ''`

### 5. Auto-Name Generation (v1.4.0)

The `name` field is optional on Create operations. The BookStack API requires it,
so `handleCreateOperation()` calls `generateFallbackName()` when `body.name` is falsy.
This allows AI agents to either:
- Generate their own name (guided by the field description)
- Omit the name entirely (fallback auto-generation kicks in)

---

## BookStack API Reference

### Authentication
```
Authorization: Token {tokenId}:{tokenSecret}
```
Base URL includes `/api` path (e.g., `https://bookstack.example.com/api`).

### Core Endpoints

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | /books | List books (supports count, offset, sort, filter) |
| GET | /books/{id} | Returns book with `contents` array (chapters + direct pages) |
| POST | /books | Create book. Required: `name` |
| PUT | /books/{id} | Update book |
| DELETE | /books/{id} | Delete book |
| GET | /chapters | List chapters |
| GET | /chapters/{id} | Returns chapter with `pages` array |
| POST | /chapters | Create chapter. Required: `name`, `book_id` |
| PUT | /chapters/{id} | Update chapter. Change `book_id` to MOVE chapter |
| DELETE | /chapters/{id} | Delete chapter |
| GET | /pages | List pages |
| GET | /pages/{id} | Returns page with full html/markdown content |
| POST | /pages | Create page. Required: `name`, `book_id` OR `chapter_id`, `html` OR `markdown` |
| PUT | /pages/{id} | Update page. Change `book_id`/`chapter_id` to MOVE page |
| DELETE | /pages/{id} | Delete page |
| GET | /shelves | List shelves |
| GET | /shelves/{id} | Returns shelf with `books` array |
| POST | /shelves | Create shelf. Required: `name` |
| PUT | /shelves/{id} | Update shelf |
| DELETE | /shelves/{id} | Delete shelf |
| GET | /search | Full-text search. Query param: `query` |
| GET | /audit-log | Activity log (requires admin permissions) |
| GET/POST/PUT/DELETE | /attachments/* | File/link attachments on pages |
| GET/POST/PUT/DELETE | /image-gallery/* | Image uploads for pages |

### Search Query Syntax

BookStack search supports inline filters appended to the query string:
- `{type:page}` / `{type:book}` / `{type:chapter}` / `{type:bookshelf}` - filter by content type
- `{in_name:text}` - search only in names/titles
- `{in_body:text}` - search only in body content
- `{tag:tagname}` - filter by tag name
- `{tag:name=value}` - filter by tag name-value pair
- `{created_by:user_id}` - filter by creator
- `{updated_by:user_id}` - filter by last editor
- `{is_restricted}` - only restricted content
- `{viewed_by_me}` / `{not_viewed_by_me}` - personal view history

### Pagination

All list endpoints support:
- `count`: Items per page (max 500)
- `offset`: Skip N items
- `sort`: Field name prefixed with `+` (asc) or `-` (desc)
- `filter[field:op]`: Field-level filtering (eq, ne, gt, gte, lt, lte, like)

### Markdown vs HTML (Important for AI Usage)

**Always prefer Markdown over HTML for page content.** Reasons:
- Markdown uses ~3x fewer tokens than equivalent HTML
- AI agents process Markdown more efficiently (less noise from tags)
- BookStack stores both formats but only one should be set per request
- **Do NOT set both `html` and `markdown`** in the same create/update call - BookStack
  will use one and ignore the other, behavior is undefined

The `html` field exists as a fallback for users who need precise formatting control
or cannot use Markdown. For AI-driven workflows, Markdown is the gold standard.

### Field Constraints

- `name`: max 255 characters (all resources)
- `description`: max 1900 characters (books, chapters, shelves)
- `tags`: Array of `{name: string, value?: string}` objects
- `books` (shelf): Array of integer book IDs

### API Endpoints NOT Implemented in This Node

These BookStack API endpoints exist but are not yet in the node:
- `GET /pages/{id}/export/html` - Export page as HTML
- `GET /pages/{id}/export/markdown` - Export page as Markdown
- `GET /pages/{id}/export/plaintext` - Export page as plain text
- `GET /books/{id}/export/html` - Export book as HTML
- `GET /books/{id}/export/pdf` - Export book as PDF
- `GET /chapters/{id}/export/html` - Export chapter as HTML
- Content comments API (if available in BookStack version)
- User/Role management endpoints
- Recycle bin endpoints
- Webhook management endpoints

---

## AI Agent Workflow (Intended Use Case)

The primary AI use case is automated content organization:

1. **Webhook triggers** when new content is created in BookStack (e.g., a note dropped into an "inbox" shelf)
2. **AI agent reads** the new content via Get Page
3. **AI searches** for where content belongs using Global Search with type filters
4. **AI navigates** the hierarchy efficiently: Get Shelf -> Get Book -> Get Chapter
5. **AI decides** to:
   - Move the page (Update Page with new `chapter_id` or `book_id`)
   - Merge with existing content (Update existing page, delete duplicate)
   - Create new structure (Create Chapter/Book if needed)
   - Rename the page (Update with new `name`)
   - Tag for categorization (Update with `tags`)
   - Archive instead of delete (see Best Practice below)

### Archive-First Best Practice (Recommended for AI Agents)

**Best practice: AI agents should move unwanted content to an "Archive" shelf
instead of deleting it.** A human can then review and permanently delete from
the archive manually. This prevents accidental data loss since delete is
permanent and cascading (deleting a book removes all its chapters and pages).

Setup:
1. Create a shelf called "Archive" in BookStack (one-time, manual)
2. Optionally create an "Archive" book inside it for orphaned pages/chapters
3. In the n8n AI Agent, either omit the Delete tool entirely, or instruct the
   agent via system prompt to prefer archiving over deletion

How to archive with existing tools:
- **Archive a page**: Update Page with `chapter_id` or `book_id` pointing to
  the Archive book/chapter
- **Archive a chapter**: Update Chapter with `book_id` pointing to the Archive book
  (all pages inside move with it automatically)
- **Archive a book**: Update the source shelf's `books` list to remove the book,
  then update the Archive shelf's `books` list to add it. Note: shelves use
  many-to-many relationships, so you need to Get both shelves first to read
  their current book lists, then Update each with the modified lists.

If the Delete tool is provided to the AI agent, it can be used at the agent's
discretion - but be aware that deletes are permanent and cascading. There is no
undo via the API (BookStack has a recycle bin in the web UI, but it is not
accessible via API).

### Token-Efficient Navigation Strategy

A BookStack with 1000 books and 100,000 pages would cost millions of tokens if loaded
entirely. The tool descriptions encode the following strategy to prevent this:

**ALWAYS DO:**
1. **Search first** (Global Search with type filter, limit 5-20) - returns only IDs, names,
   and short previews (~50 tokens per result vs ~5000 tokens for full page content)
2. **Get single items by ID** - after Search identifies candidates, fetch only the specific
   pages/books/chapters you need to inspect
3. **Use tags** for categorization - enables `{tag:name}` search without scanning content
4. **Navigate top-down** when needed: Get Shelf (lists books) -> Get Book (lists chapters
   and pages) -> Get Chapter (lists pages) -> Get Page (full content)

**NEVER DO:**
- `Get Many Pages` with `Return All = true` - loads ALL pages from the instance
- `Get Many` with high limits (>50) when you only need a few specific items
- `Deep Dive` with `Return All` or high limits - multiplies API calls (N+1 pattern)
- Fetch full content of items you don't need to read

**Token cost comparison (approximate):**
| Operation | Tokens per item | 1000 items |
|-----------|----------------|------------|
| Search result (preview) | ~50 | ~50,000 |
| Get Many result (no content) | ~100 | ~100,000 |
| Get single page (full content) | ~2,000-50,000 | CATASTROPHIC |
| Deep Dive search result | ~2,000-50,000 | CATASTROPHIC |

---

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm run build        # Build TypeScript to dist/
pnpm run dev          # Start local n8n instance with this node
pnpm run lint         # Run ESLint
pnpm run format       # Check formatting with Prettier
pnpm run lint:fix     # Auto-fix lint issues
pnpm run format:fix   # Auto-fix formatting
```

### Build Output

`pnpm build` runs `n8n-node build` which:
1. Compiles TypeScript from `nodes/` and `credentials/` to `dist/`
2. Copies static files (icons, JSON metadata)

The `dist/` directory is what n8n loads at runtime.

---

## Testing Notes

- No automated test suite exists yet
- Test manually by running `pnpm run dev` and using the node in n8n UI
- Key scenarios to test after changes:
  - Create Page/Book/Chapter/Shelf with name (should work as before)
  - Create Page/Book/Chapter/Shelf without name (should auto-generate)
  - Update Page with different `book_id`/`chapter_id` (should move page)
  - Global Search with various filters
  - Deep Dive on search results

---

## Known Issues

See `KNOWN_ISSUES.md` for a full list of 16 pre-existing issues found during QA audit.
The top 3 most impactful:

1. **Tags don't support name:value pairs** - `"topic:networking"` becomes
   `{name: "topic:networking"}` instead of `{name: "topic", value: "networking"}`.
   The `{tag:name=value}` search syntax won't work with these tags.
2. **Audit-log sort baked into URL** - `sort=-created_at` is in the URL path string
   instead of the query parameters object. Fragile but works.
3. **Attachment/Image limit ignores returnAll** - The `.map()` in these description
   files overwrites `displayOptions` instead of merging, so Limit stays visible
   when Return All is on.

---

## Common Pitfalls

1. **`getNodeParameter` fallback**: Always pass `undefined` as third arg for optional fields,
   not `''`. Empty string would be treated as a provided value.

2. **Tags format**: UI accepts comma-separated strings, but BookStack API expects
   `[{name: "tag"}]`. The `buildRequestBody()` method handles conversion automatically.

3. **Shelf books format**: UI accepts comma-separated IDs (e.g., "1,5,12"), converted
   to `[1, 5, 12]` integer array by `buildRequestBody()`.

4. **Attachment/Image creation**: These bypass `buildRequestBody()` and `handleCreateOperation()`.
   They use dedicated multipart handlers. Changes to the shared create flow do NOT affect them.

5. **Page requires content**: Unlike books/chapters/shelves, pages MUST have either
   `html` or `markdown` on creation. This is enforced by `validatePageCreation()`.
   Always use `markdown` unless the user explicitly needs HTML. Never set both fields.

6. **Moving content**: Pages are moved by setting `book_id` or `chapter_id` on Update.
   Chapters are moved by setting `book_id` on Update. Books cannot be moved (they're top-level).
   Shelves reference books via the `books` ID array (many-to-many).

7. **Search type filter**: The node appends `{type:X}` to the search query string.
   BookStack type values: `page`, `chapter`, `book`, `bookshelf` (note: "bookshelf", not "shelf").

8. **`new Bookstack()` in execute()**: The `execute()` method has `this: IExecuteFunctions`
   (n8n binds `this` to the execution context, not the class). All instance methods are
   called via `const nodeInstance = new Bookstack()`. This works because all needed state
   (`resourceEndpoints`, `resourceFields`) comes from class field declarations, not
   constructor parameters.

9. **Audit-log sort parameter**: The sort is baked into the URL string
   (`'/audit-log?sort=-created_at'`). Don't add a separate `sort` to `qs` or it will
   conflict. See KNOWN_ISSUES.md #2.

10. **`decodeHtmlEntities` limitations**: Only used for fallback name generation.
    Does not handle hex entities (except `&#x27;`), `&apos;`, or case-insensitive
    entity names (except `&nbsp;`). Double-decodes `&amp;lt;` to `<`. Acceptable
    for its limited scope but don't reuse for general HTML processing.

11. **NodeApiError detection**: Uses string comparison (`e?.constructor?.name === 'NodeApiError'`)
    which could break under minification. If you need to modify error handling, consider
    using `instanceof` with proper imports instead.

---

## Version History

| Version | Key Changes |
|---------|-------------|
| 1.4.0 | Optional name on Create, auto-name generation, AI-optimized descriptions, token-efficient navigation strategy, markdown-first, CLAUDE.md, KNOWN_ISSUES.md |
| 1.3.0 | Attachment resource support with CRUD and multipart handling |
| 1.2.0 | Image resource support with CRUD and multipart handling |
| 1.1.0 | Switch to pnpm |
| 1.0.0 | Deep Dive in main node, "Return All" pagination, unified search |
| 0.11.x | Audit log, simplified API, multi-Node version matrix |
| 0.10.x | Initial release, BookStack CRUD for books/pages/chapters/shelves |
