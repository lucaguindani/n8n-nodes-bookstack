# n8n-nodes-bookstack

[![CI](https://github.com/lucaguindani/n8n-nodes-bookstack/actions/workflows/ci.yml/badge.svg)](https://github.com/lucaguindani/n8n-nodes-bookstack/actions/workflows/ci.yml)

This is a n8n community node that lets you use BookStack in your n8n workflows. The [n8n](https://n8n.io/) project is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

BookStack is an open source, self‑hosted documentation / knowledge base platform for organizing and sharing content via books, chapters, pages, and shelves.

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)
- [License](#license)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

---
## Installation

### Community node
Follow the official guide: [Install a community node](https://docs.n8n.io/integrations/community-nodes/installation/).

### Manual (custom code folder)
If you are running a self‑hosted n8n and want to build from source:
```bash
# Go to your n8n custom folder
mkdir -p ~/.n8n/custom && cd ~/.n8n/custom

# Clone the repository
git clone https://github.com/lucaguindani/n8n-nodes-bookstack.git
cd n8n-nodes-bookstack

# Install dependencies & build
pnpm install
pnpm run build

# Restart n8n so the node is loaded
```
After restart, search for "BookStack" in the node picker.

---
## Operations
The node exposes CRUD + search and audit capabilities for core BookStack entities.

Resource: Book
- Get Many / Get / Create / Update / Delete / Export (HTML, PDF, Plain Text, Markdown, ZIP)

Resource: Page
- Get Many / Get / Create / Update / Delete / Export (HTML, PDF, Plain Text, Markdown, ZIP)

Resource: Chapter
- Get Many / Get / Create / Update / Delete / Export (HTML, PDF, Plain Text, Markdown, ZIP)

Resource: Shelf
- Get Many / Get / Create / Update / Delete

Resource: Image
- Get Many / Get / Create / Update / Delete

Resource: Attachment
- Get Many / Get / Create / Update / Delete

Resource: Comment
- Get Many / Get / Create / Update / Delete

Resource: Global
- Search / Audit Log / Get System Info

---
## Credentials
You need a BookStack API Token.
1. In BookStack, open: My Account → Access & Security (`/my-account/auth`)
2. Create a token; copy Token ID and Token Secret
3. In n8n, create new credentials of type "Bookstack API":
   - Base URL: e.g. `https://your-bookstack.example.com/api`
   - Token ID
   - Token Secret
4. Save and use in the node

Required permission: The token inherits the permissions of the user who created it. Ensure that user can read/create/update intended entities. Audit Log requires permission to manage both users and system settings.

---
## Compatibility
### n8n
1.85 or newer

### Bookstack
Every operation asks BookStack for its version before running and stops with a clear message if it needs a newer version. To turn the check off, use the "Skip Version Check" option on the node.

---
## Usage
### Listing (Get Many)
- Return All: When enabled, the node will automatically paginate through all results.
- Limit: When "Return All" is disabled, sets the maximum number of items to return.
- Sort By / Sort Direction
- Filters (field, operation, value)

Internally, the node handles pagination (count/offset) for you when needed.

### Global Search
- Provide a search query and optionally pick a content type (book, page, chapter, shelf)
- "Return All" / "Limit" to control the amount of results
- "Deep Dive" to automatically fetch full content for all search results. This provides complete context but increases execution time and API calls.

### Image & Attachment
- "Binary Property" to tell the node which binary key on the current item holds the file. For example, if a previous node (HTTP Request, Read Binary File, etc.) stored the file under the key `data`, enter `data` here. The node will read that binary entry and attach it as the file in the request.

### Export
Books, chapters and pages can be exported as HTML, PDF, Plain Text, Markdown or ZIP.

- "Format" selects the file type.
- "Put Output File in Field" is the binary field that receives the file (default `data`). Use a different name per export if you want to keep several files on the same item.

Each export returns one item. The file is in the item's binary data, and the JSON describes it:

```json
{ "id": "2", "resource": "page", "format": "pdf", "fileName": "test-page-1.pdf", "mimeType": "application/pdf", "size": 454443 }
```

To use the file in a workflow:
- Save or send it as is: Read/Write Files from Disk, Google Drive, S3, Send Email, HTTP Request (body type "n8n Binary File"), etc.
- Read its text: Extract From File (Text File for HTML, Markdown and Plain Text; PDF for PDF).

### Tags
When creating or updating entities, tags accepts a comma-separated string. Each tag can be either a plain name (`tag1, tag2`) or a name:value pair (`Category:Fiction, Rating:5`). Both formats can be mixed freely.

---
## Resources
* n8n Community Nodes Docs: https://docs.n8n.io/integrations/#community-nodes
* BookStack Documentation: https://www.bookstackapp.com/docs/
* BookStack API Reference: https://demo.bookstackapp.com/api/docs
* BookStack GitHub: https://github.com/BookStackApp/BookStack

---
## License
This project is licensed under the MIT License – see [LICENSE.md](./LICENSE.md).

---
## Contributing
To lunch a local instance, make sure Node 24+ and pnpm 12+ are installed, then run the following from the root directory of the project.

```bash
pnpm install
pnpm run dev
```

You should be able to connect to `http://localhost:5678`.

Pull requests are welcome. For significant changes, open an issue first to discuss scope.

Before committing, ensure build passes and no lint or formatting errors are found.

```bash
pnpm run lint
pnpm run format
pnpm run build
```

Please provide a clear PR description.

---
## Disclaimer
This community node is not an official BookStack product. Use at your own risk; validate results in critical workflows.
