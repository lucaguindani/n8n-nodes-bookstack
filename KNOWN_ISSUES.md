# Known Issues

Issues found during QA audit (v1.4.0). Items marked **(v1.4.0)** were introduced
by the v1.4.0 changes. All others are pre-existing.

---

## MEDIUM Severity

### ~~1. Tags do not support BookStack name:value pairs~~ **FIXED in v1.4.0**

Tags now support `name:value` pairs. Input `"topic:networking"` produces
`{name: "topic", value: "networking"}`. The `{tag:name=value}` search syntax works.

---

### 2. Audit-log endpoint has query parameter baked into the URL path

**File:** `nodes/Bookstack/Bookstack.node.ts`, line 382

**Description:** The endpoint string is `'/audit-log?sort=-created_at'` with additional
`qs` parameters (`count`, `offset`) passed separately. The HTTP library constructs:
`baseUrl/audit-log?sort=-created_at&count=50&offset=0`

While most HTTP libraries handle this correctly by appending with `&`, it is fragile
and unconventional.

**Suggested Fix:** Move `sort` into the `qs` object:

```typescript
const qs = { count, offset, sort: '-created_at' } as IDataObject;
const res = await bookstackApiRequest.call(context, 'GET', '/audit-log', {}, qs);
```

---

### 3. Attachment and Image limit field ignores returnAll condition

**Files:**
- `nodes/Bookstack/descriptions/Attachment.description.ts`, lines 216-224
- `nodes/Bookstack/descriptions/Image.description.ts`, lines 123-131

**Description:** Both files use `.map()` which completely **replaces** the original
`displayOptions` from `ListOperations.ts`. The `limit` field has
`displayOptions: { show: { returnAll: [false] } }` to hide when "Return All" is enabled.
For attachments and images, this condition is lost.

Compare with Book/Page/Chapter/Shelf descriptions which correctly use:
```typescript
...(op.displayOptions?.show ?? {})
```

**Impact:** The Limit field remains visible in the UI even when "Return All" is toggled on
for Attachment and Image resources.

**Suggested Fix:** Use the same spread pattern as the other description files.

---

### 4. handleAuditLogOperation lacks Array.isArray safety check

**File:** `nodes/Bookstack/Bookstack.node.ts`, line 386

**Description:** The line casts directly without verifying the result is an array:

```typescript
const data: JsonObject[] = (res?.data ?? res) as JsonObject[];
```

Compare with `handleGetAllOperation` which safely checks:
```typescript
Array.isArray(data) ? (data as JsonObject[]) : []
```

**Impact:** If the API response shape changes or returns an error object,
`aggregated.push(...data)` would throw a runtime error.

---

## LOW Severity

### 5. No filename sanitization in multipart upload

**File:** `nodes/Bookstack/utils/BookstackApiHelpers.ts`, line 101

The `fileName` from `binaryData.fileName` is interpolated directly into the
`Content-Disposition` header. If the filename contains double quotes or CRLF
characters, it could break multipart parsing. Unlikely in practice.

---

### 6. No trailing-slash normalization on baseUrl

**File:** `nodes/Bookstack/utils/BookstackApiHelpers.ts`, line 46

If the user configures `baseUrl` as `https://example.com/api/` (with trailing slash),
the resulting URL will have a double slash: `https://example.com/api//pages`.
Most web servers handle this, but a `.replace(/\/+$/, '')` on `baseUrl` would be cleaner.

---

### 7. HTML heading regex does not enforce matching tag levels

**File:** `nodes/Bookstack/Bookstack.node.ts`, line 143

The regex `/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i` would match `<h1>text</h2>`
(mismatched levels). Extremely unlikely with BookStack-generated HTML. Only affects
fallback name generation.

---

### 8. decodeHtmlEntities inconsistent case sensitivity

**File:** `nodes/Bookstack/Bookstack.node.ts`, lines 115-123

`&nbsp;` is matched with `/gi` (case-insensitive) but other entities use `/g`
(case-sensitive). So `&NBSP;` decodes but `&AMP;` does not. In practice HTML
entities are almost always lowercase.

---

### 9. decodeHtmlEntities does not handle hex numeric entities

**File:** `nodes/Bookstack/Bookstack.node.ts`, line 123

Only decimal numeric entities (`&#65;`) are handled. Hex entities like `&#x41;`
are not decoded (except the explicitly handled `&#x27;`). Acceptable since the
method is only used for fallback name generation.

---

### 10. decodeHtmlEntities missing &apos; entity

**File:** `nodes/Bookstack/Bookstack.node.ts`, lines 114-124

Handles `&#39;` and `&#x27;` (apostrophe) but not the named entity `&apos;`.
Valid XML/HTML5 but less common in BookStack output.

---

### 11. NodeApiError detection via string comparison

**File:** `nodes/Bookstack/Bookstack.node.ts`, line 753

`e?.constructor?.name === 'NodeApiError'` relies on class name surviving minification.
Using `instanceof NodeApiError` (with import) would be safer.

---

### 12. Null error in catch block could cause secondary TypeError

**File:** `nodes/Bookstack/Bookstack.node.ts`, line 756

If `error` is `null` (extremely unlikely), `e.message` would throw TypeError.
Using `e?.message` would be more defensive.

---

## INFO Severity

### 13. tsconfig.json references non-existent .eslintrc.js

**File:** `tsconfig.json`, line 28

The `include` array references `./.eslintrc.js` which does not exist. Silently
ignored by TypeScript but represents stale configuration.

---

### 14. Type aliases add no type safety

**File:** `nodes/Bookstack/Bookstack.node.ts`, lines 26-27

`SearchItemMinimal` and `ContentResponseShape` are both aliases for `IDataObject`.
Consider using proper interfaces with defined properties.

---

### 15. handleUpdateImageOperation can send empty multipart request

**File:** `nodes/Bookstack/Bookstack.node.ts`, lines 576-592

If `name` and `binaryPropertyName` are both empty, a multipart form with zero fields
is sent. BookStack API would return a validation error.

---

### 16. Double-decoding potential in decodeHtmlEntities

**File:** `nodes/Bookstack/Bookstack.node.ts`, lines 114-124

Replacement order means `&amp;lt;` becomes `&lt;` then `<` (double-decoded).
Acceptable for fallback name generation but not faithful HTML entity decoding.

---

### 17. `requiresDataPath: 'single'` on search query field

**File:** `nodes/Bookstack/descriptions/Global.description.ts`, line 29

The `requiresDataPath: 'single'` property on the search query field is unusual for
a plain text search string. This property is typically used for expression-mode fields
that need data path resolution. On a plain search string field, this could cause
unexpected behavior in certain n8n execution contexts. May be intentional for AI
tool usage but warrants verification.

---

### 18. No `continueOnFail()` support in execute()

**File:** `nodes/Bookstack/Bookstack.node.ts`, lines 747-758

The catch block always rethrows errors. It never checks `this.continueOnFail()`,
which is a common n8n pattern for allowing workflows to continue despite errors.
Items that fail will halt the entire node execution. This may be intentional for
data integrity but limits error resilience in batch workflows.

---

### 19. Multipart request handler has no try/catch error wrapping

**File:** `nodes/Bookstack/utils/BookstackApiHelpers.ts`, line 122

The `bookstackApiRequest()` function wraps HTTP errors in `NodeApiError` for clean
error messages. The `bookstackApiRequestMultipart()` function does NOT - errors from
attachment/image uploads propagate as raw, unformatted exceptions. Users see
unfriendly error messages on upload failures.

**Suggested Fix:** Add the same try/catch pattern:
```typescript
try {
    return await this.helpers.httpRequestWithAuthentication.call(this, 'bookstackApi', options);
} catch (error) {
    throw new NodeApiError(this.getNode(), error);
}
```

---

### 20. Redundant credential null checks

**File:** `nodes/Bookstack/utils/BookstackApiHelpers.ts`, lines 32-35 and 67-70

`if (!credentials)` check after `await this.getCredentials('bookstackApi')`. The
`getCredentials()` method already throws if credentials are not found, so these
checks are dead code. Not harmful, just redundant.

---

### ~~21. `!body.name` falsy check is too broad~~ **FIXED in v1.4.0**

The check now uses `body.name === undefined || body.name === ''` instead of `!body.name`.

---

### 22. Removing `required: true` from name silently accepts empty names **(v1.4.0)**

**Files:** Page/Book/Chapter/Shelf description files

Previously, the n8n UI blocked submission when the name field was empty (enforced
by `required: true`). Now the UI allows it and the node auto-generates a fallback
name (e.g. `page-2026-04-08T14-30-00`). Manual users who accidentally leave the
name empty will not get a validation error - they will get an auto-generated name
they may not notice until later.

This is an intentional design decision for AI agent usage but changes behavior
for manual users.

---

### ~~23. Page ID description is misleading for Delete operation~~ **FIXED in v1.4.0**

The ID field description now documents all three operations separately:
Get returns fields, Update returns updated object, Delete returns empty on success.

---

### 24. README typo: "lunch" instead of "launch"

**File:** `README.md`, line 122

"To lunch a local instance" should be "To launch a local instance".
