export type ExportResource = 'book' | 'chapter' | 'page';
export type ExportFormat = 'html' | 'pdf' | 'plaintext' | 'markdown' | 'zip';

const EXPORT_ENDPOINTS: Record<ExportResource, string> = {
	book: 'books',
	chapter: 'chapters',
	page: 'pages',
};

export const EXPORT_FORMATS: Record<ExportFormat, { extension: string; mimeType: string }> = {
	html: { extension: 'html', mimeType: 'text/html' },
	pdf: { extension: 'pdf', mimeType: 'application/pdf' },
	plaintext: { extension: 'txt', mimeType: 'text/plain' },
	markdown: { extension: 'md', mimeType: 'text/markdown' },
	zip: { extension: 'zip', mimeType: 'application/zip' },
};

export function isExportResource(resource: string): resource is ExportResource {
	return Object.prototype.hasOwnProperty.call(EXPORT_ENDPOINTS, resource);
}

export function isExportFormat(format: string): format is ExportFormat {
	return Object.prototype.hasOwnProperty.call(EXPORT_FORMATS, format);
}

export function buildExportPath(resource: ExportResource, id: string, format: ExportFormat) {
	return `/${EXPORT_ENDPOINTS[resource]}/${id}/export/${format}`;
}

/**
 * File name from a Content-Disposition header, or `{resource}-{id}.{extension}` when absent
 */
export function getExportFileName(
	contentDisposition: unknown,
	resource: ExportResource,
	id: string,
	format: ExportFormat,
): string {
	const fallback = `${resource}-${id}.${EXPORT_FORMATS[format].extension}`;
	if (typeof contentDisposition !== 'string') return fallback;

	const encoded = contentDisposition.match(/filename\*\s*=\s*[^']*'[^']*'([^;]+)/i);
	const plain = contentDisposition.match(/filename\s*=\s*(?:"([^"]*)"|([^;]+))/i);

	let name = plain?.[1] ?? plain?.[2]?.trim();
	if (encoded) {
		try {
			name = decodeURIComponent(encoded[1].trim());
		} catch {
			// Keep the plain filename when the encoded one is malformed
		}
	}

	// Keep only the last path segment so a header cannot point outside the intended name
	const baseName = name?.split(/[\\/]/).pop()?.trim();
	return baseName && baseName !== '.' && baseName !== '..' ? baseName : fallback;
}

/**
 * MIME type from a Content-Type header, or the format's default when the header is absent
 * or generic (BookStack serves exports as application/octet-stream)
 */
export function getExportMimeType(contentType: unknown, format: ExportFormat): string {
	if (typeof contentType === 'string') {
		const mimeType = contentType.split(';')[0].trim();
		if (mimeType && mimeType !== 'application/octet-stream') return mimeType;
	}
	return EXPORT_FORMATS[format].mimeType;
}

/**
 * Error bodies of binary requests arrive as raw bytes; decode them so the API's error message
 * (JSON or text) is not lost
 */
export function decodeErrorBody(body: unknown): unknown {
	if (!Buffer.isBuffer(body) && !(body instanceof ArrayBuffer)) return body;

	const text = Buffer.from(body as ArrayBuffer).toString('utf8');
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}
