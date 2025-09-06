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
