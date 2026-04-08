# Known Issues

Pre-existing issues found during QA audit (v1.4.0). None of these are regressions
from v1.4.0 changes - all exist in earlier versions.

---

## MEDIUM Severity

### 1. Tags do not support BookStack name:value pairs

**File:** `nodes/Bookstack/Bookstack.node.ts`, lines 99-101

**Description:** The description text in multiple files uses examples like
`"topic:networking, status:reviewed"`, implying name:value tag pairs. However,
`buildRequestBody` converts tags via:

```typescript
body.tags.split(',').map((t: string) => ({ name: t.trim() }))
```

This means `"topic:networking"` becomes `{name: "topic:networking"}` instead of
`{name: "topic", value: "networking"}`. BookStack's API uses `name` and `value`
as separate properties for tag filtering (`{tag:topic=networking}`).

**Impact:** Tags with colon-separated values are stored as literal tag names. The
`{tag:name=value}` search syntax won't work with these tags.

**Suggested Fix:** Split each tag on the first `:` to produce `{name, value}` objects:

```typescript
body.tags = body.tags.split(',').map((t: string) => {
    const trimmed = t.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
        return { name: trimmed.slice(0, colonIdx), value: trimmed.slice(colonIdx + 1) };
    }
    return { name: trimmed };
});
```

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
