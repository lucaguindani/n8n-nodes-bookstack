# n8n-nodes-bookstack

Custom n8n node for interacting with [BookStack](https://www.bookstackapp.com/) via its API.  
Supports **Books**, **Pages**, **Shelves**, **Chapters**, and **Global Search** (with filters & pagination).  

---

## 🚀 Installation

1. Clone or copy this project into your local n8n custom nodes folder:  
```bash
mkdir -p ~/.n8n/custom && cd ~/.n8n/custom
git clone https://github.com/your-repo/n8n-nodes-bookstack.git
```
2. Build the project:
```bash
cd n8n-nodes-bookstack
npm install
npm run build
```
3. Restart n8n, and the Bookstack node should appear in your node list.

## 🔑 Authentication

1. In BookStack, go to Settings → API Tokens.
2. Create a new token for your user.
3. Copy the Token ID and Secret.
4. In n8n, configure credentials for Bookstack API with your Base URL (e.g., `https://your-bookstack.com/api/`) and the token values.

## ⚙️ Usage

**Global Search Example**
- Add the Bookstack node.
- Select Resource: Global and Operation: Search.
- Provide a `query` string, e.g.:
```bash
kubernetes {type:page}
```

## 🧪 Example Workflow

A ready-made workflow is included in `workflows/global-search-example.json`.
It demonstrates a simple global search returning raw JSON results.

To import it in n8n:
- Go to Workflows → Import from File
- Select `global-search-example.json`

## 🛠️ Troubleshooting

- **401 Unauthorized**
   - Check your API token and secret.
   - Make sure the user has the correct permissions.
- **404 Not Found**
   - Verify your Base URL includes `/api`. Example: `https://your-bookstack.com/api/`.
- **Empty results**
   - Try adding filters in your query: `{type:page}`, `{type:book}`, etc.
- **Pagination quirks**
   - BookStack may return up to 4× the requested `count`.
   - Use `page` and `count` parameters to control responses.
