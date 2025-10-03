# n8n-nodes-bookstack

[![CI](https://github.com/lucaguindani/n8n-nodes-bookstack/actions/workflows/ci.yml/badge.svg)](https://github.com/lucaguindani/n8n-nodes-bookstack/actions/workflows/ci.yml)

This is an n8n community node that lets you use BookStack in your n8n workflows. The [n8n](https://n8n.io/) project is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

BookStack is an open source, self‑hosted documentation / knowledge base platform for organizing and sharing content via books, chapters, pages, and shelves.

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)
- [License](#license)
- [Contributing](#contributing)
- [Security](#security)
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
npm install
npm run build

# Restart n8n so the node is loaded
```
After restart, search for "BookStack" in the node picker.

---
## Operations
The node exposes CRUD + search and audit capabilities for core BookStack entities.

Resource: Book
- Get Many / Get / Create / Update / Delete

Resource: Page
- Get Many / Get / Create / Update / Delete

Resource: Chapter
- Get Many / Get / Create / Update / Delete

Resource: Shelf
- Get Many / Get / Create / Update / Delete

Resource: Global
- Search (full‑text multi‑type search with optional type restriction)
- Audit Log (list audit events with pagination)

AI Tool (Bookstack Tool node)
- Global Search (optional full content and audit logs retrieval)

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
Tested with:
- n8n 1.109+
- Bookstack 24.5+
- Node 18+

---
## Usage
### Listing (Get Many)
Standard query parameters supported:
- count (max results per request, 1–500)
- offset (starting index)
- sort (field name, ascending/descending)
- filter (field name, operation, value)

### Global Search
- Provide a search query and optionally pick a content type (book, page, chapter, shelf)
- Limit and page control pagination

### Tags
When creating/updating entities, `tags` can be provided as a comma‑separated list: `tagA, tagB`.

### AI Tool Node
Use the companion "BookStack Tool" node in AI workflows:
- Global search that can optionally fetch full content and audit logs for downstream LLM processing.

### Error Handling
Common errors are formatted for clarity:
- 401: credentials invalid
- 403: insufficient permissions
- 404: resource not found
- 422: validation issue
- 429: rate limit

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
To lunch a local instance, make sure Node 18+ is installed, then run the following from the root directory of the project.

```bash
npm install
npm run dev
```

You should be able to connect to `http://localhost:5678`.

Pull requests are welcome. For significant changes, open an issue first to discuss scope.

Before committing, ensure build passes and no lint or formatting errors are found.

```bash
npm run lint
npm run format
npm run build
```

Please provide a clear PR description.

---
## Security
Do not commit BookStack credentials. Tokens inherit user permissions—consider creating a dedicated low‑privilege API user.

---
## Disclaimer
This community node is not an official BookStack product. Use at your own risk; validate results in critical workflows.
