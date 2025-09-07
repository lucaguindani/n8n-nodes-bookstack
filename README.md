# n8n-bookstack

Custom n8n node for interacting with [BookStack](https://www.bookstackapp.com/) via its API.
Supports **Books**, **Pages**, **Shelves**, **Chapters**, and **Global Search** (with filters & pagination).

---

## 🚀 Installation

1. Clone or copy this project into your local n8n custom nodes folder:  
```bash
mkdir -p ~/.n8n/custom && cd ~/.n8n/custom
git clone https://github.com/lucaguindani/n8n-bookstack.git
```
2. Build the project:
```bash
cd n8n-bookstack
npm install
npm run build
```
3. Restart n8n, and the Bookstack node should appear in your node list.

## 🔑 Authentication

1. In BookStack, go to `/my-account/auth`.
2. Create a new token for your user.
3. Copy the Token ID and Secret.
4. In n8n, configure credentials for Bookstack API with your Base URL (e.g., `https://your-bookstack.com/api/`) and the token values.

---

## ✨ Nouvelles fonctionnalités

### Global → Audit Log - List
- Opération: `Audit Log - List`
- Endpoint: `GET /audit-log`
- Champs:
  - `Limit` (auditLimit): nombre d’entrées à récupérer (1–500)
  - `Offset` (auditOffset): décalage de pagination
- Sortie: tableau d’entrées d’audit en JSON (selon BookStack)

Exemple d’usage:
- Node Bookstack, Resource: Global, Operation: Audit Log - List, Limit: 100, Offset: 0

### Page → Export
- Opération: `Export`
- Endpoints:
  - `GET /pages/:id/export-html`
  - `GET /pages/:id/export-pdf`
  - `GET /pages/:id/export-plain-text`
  - `GET /pages/:id/export-markdown`
  - `GET /pages/:id/export-zip`
- Champs:
  - `Page ID` (id): id de la page
  - `Format` (exportFormat): `html | pdf | plain-text | markdown | zip`
  - `Binary Property` (binaryProperty): nom de la propriété binaire en sortie (par défaut `data`)
  - `File Name` (fileName): nom du fichier de sortie (par défaut `page-<id>.<ext>`)
- Sortie: item avec binaire à la propriété choisie + métadonnées JSON `{ id, format, fileName }`

Exemple d’usage:
- Node Bookstack, Resource: Page, Operation: Export, Page ID: 123, Format: PDF, Binary Property: `data`, File Name: `my-page.pdf`

---

## 🧪 Tests rapides

Après build, vous pouvez tester dans n8n:
- Global → Audit Log - List: vérifiez que vous recevez des entrées d’audit.
- Page → Export (PDF, Markdown, etc.): utilisez un nœud Binary → Write Binary File pour sauvegarder le fichier exporté.

---

## ℹ️ Notes
- Les limites BookStack pour la pagination sont respectées (max 500 par requête).
- Les exports utilisent une réponse binaire et définissent le type MIME automatiquement selon le format.
