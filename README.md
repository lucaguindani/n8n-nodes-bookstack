# n8n-nodes-bookstack

This is an n8n community node. It lets you use BookStack in your n8n workflows.

BookStack is an open source, self‑hosted documentation / knowledge base platform for organizing and sharing content via books, chapters, pages, and shelves.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)  
[License](#license)
[Contributing](#contributing)
[Security](#security)
[Disclaimer](#disclaimer)

---
## Installation

### Community node (recommended)
Follow the official guide: [Install a community node](https://docs.n8n.io/integrations/community-nodes/installation/).

Package name (if published to npm): (pending publication)

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
- Search (full‑text multi‑type search; optional type restriction)
- Audit Log (list audit events with pagination)

AI Tool (Bookstack Tool node)
- Global Search (optional deep content retrieval)
- Get Book Details
- Search Books
- Get Page Content
- List All Books

---
## Credentials
You need a BookStack API Token.
1. In BookStack, open: My Profile → API Tokens (`/my-account/api-tokens` or `/my-account/auth` depending on version).
2. Create a token; copy Token ID and Token Secret.
3. In n8n, create new credentials of type "Bookstack API":
   - Base URL: e.g. `https://your-bookstack.example.com/api`
   - Token ID
   - Token Secret
4. Save and use in the node.

Required permission: The token inherits the permissions of the user who created it. Ensure that user can read/create/update intended entities.

---
## Compatibility
- Tested with n8n 1.109.  
- BookStack API versions: tested against BookStack 23.x and 24.x (standard REST endpoints).  
- Max page size enforced by BookStack: 500 items per request.

---
## Usage
### Listing (Get Many)
Standard query parameters supported (mirrors BookStack API):
- count (max results per request, 1–500)
- offset (starting index)
- sort (field name, ascending/descending)
- filter (field name, operation, value)

### Global Search
- Provide a search query and optionally pick a content type (book, page, chapter, shelf).
- Limit and page control pagination.

### Tags
When creating/updating entities, `tags` can be provided as a comma‑separated list: `tagA, tagB`.

### AI Tool Node
Use the companion "BookStack Tool" node in AI workflows:
- Global search that can optionally fetch full content (with the "Deep Dive Into Content" option) for downstream LLM processing.

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
## Version history
| Version | Date       | Changes |
|---------|------------|---------|
| 0.9.0   | 2025-09-10 | Initial public version: CRUD resources, search, audit log, filters, sorting, AI tool. |

---
## License
This project is licensed under the MIT License – see [LICENSE](./LICENSE).

---
## Contributing
Pull requests welcome. For significant changes, open an issue first to discuss scope. Run:
```bash
npm install
npm run lint
npm run format
npm run build
```
Before committing, ensure build passes and no lint errors. Provide clear PR description.

---
## Security
Do not commit BookStack credentials. Tokens inherit user permissions—consider creating a dedicated low‑privilege API user.

---
## Disclaimer
This community node is not an official BookStack product. Use at your own risk; validate results in critical workflows.
