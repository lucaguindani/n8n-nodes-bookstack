import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	EXPORT_FORMATS,
	ExportFormat,
	ExportResource,
	buildExportPath,
	decodeErrorBody,
	getExportFileName,
	getExportMimeType,
	isExportFormat,
	isExportResource,
} from '../nodes/Bookstack/utils/exportHelpers';

const resources: Array<[ExportResource, string]> = [
	['book', 'books'],
	['chapter', 'chapters'],
	['page', 'pages'],
];
const formats = Object.keys(EXPORT_FORMATS) as ExportFormat[];

describe('buildExportPath', () => {
	for (const [resource, endpoint] of resources) {
		for (const format of formats) {
			it(`builds the ${resource} ${format} endpoint`, () => {
				assert.equal(buildExportPath(resource, '42', format), `/${endpoint}/42/export/${format}`);
			});
		}
	}
});

describe('isExportResource / isExportFormat', () => {
	it('accepts only book, chapter and page', () => {
		assert.equal(isExportResource('book'), true);
		assert.equal(isExportResource('chapter'), true);
		assert.equal(isExportResource('page'), true);
		assert.equal(isExportResource('shelf'), false);
		assert.equal(isExportResource('comment'), false);
		assert.equal(isExportResource('toString'), false);
	});

	it('accepts only the five export formats', () => {
		for (const format of formats) assert.equal(isExportFormat(format), true);
		assert.equal(isExportFormat('docx'), false);
		assert.equal(isExportFormat(''), false);
	});
});

describe('EXPORT_FORMATS', () => {
	it('maps every format to an extension and MIME type', () => {
		assert.deepEqual(
			formats.map((f) => [f, EXPORT_FORMATS[f].extension, EXPORT_FORMATS[f].mimeType]),
			[
				['html', 'html', 'text/html'],
				['pdf', 'pdf', 'application/pdf'],
				['plaintext', 'txt', 'text/plain'],
				['markdown', 'md', 'text/markdown'],
				['zip', 'zip', 'application/zip'],
			],
		);
	});
});

describe('getExportFileName', () => {
	it('reads a quoted filename', () => {
		const header = 'attachment; filename="my-page.pdf"';
		assert.equal(getExportFileName(header, 'page', '1', 'pdf'), 'my-page.pdf');
	});

	it('reads an unquoted filename', () => {
		assert.equal(
			getExportFileName('attachment; filename=my-book.md', 'book', '1', 'markdown'),
			'my-book.md',
		);
	});

	it('prefers the encoded filename* form', () => {
		const header = `attachment; filename="fallback.html"; filename*=UTF-8''caf%C3%A9.html`;
		assert.equal(getExportFileName(header, 'page', '1', 'html'), 'café.html');
	});

	it('falls back to resource, id and extension without a header', () => {
		assert.equal(getExportFileName(undefined, 'chapter', '7', 'plaintext'), 'chapter-7.txt');
		assert.equal(getExportFileName('attachment', 'book', '3', 'zip'), 'book-3.zip');
	});

	it('keeps only the last path segment', () => {
		const header = 'attachment; filename="../../etc/passwd"';
		assert.equal(getExportFileName(header, 'page', '1', 'html'), 'passwd');
	});

	it('falls back when the filename is only a dot segment', () => {
		assert.equal(getExportFileName('attachment; filename=".."', 'page', '1', 'html'), 'page-1.html');
		assert.equal(getExportFileName('attachment; filename="a/."', 'page', '1', 'html'), 'page-1.html');
	});

	it('ignores a malformed encoded filename and uses the plain one', () => {
		const header = `attachment; filename="plain.html"; filename*=UTF-8''%E0%A4%A`;
		assert.equal(getExportFileName(header, 'page', '1', 'html'), 'plain.html');
	});
});

describe('getExportMimeType', () => {
	it('uses the response content type without parameters', () => {
		assert.equal(getExportMimeType('text/html; charset=UTF-8', 'html'), 'text/html');
		assert.equal(getExportMimeType('application/zip', 'zip'), 'application/zip');
	});

	it('treats the generic octet-stream type as missing', () => {
		assert.equal(getExportMimeType('application/octet-stream', 'pdf'), 'application/pdf');
		assert.equal(getExportMimeType('application/octet-stream; charset=x', 'zip'), 'application/zip');
	});

	it('falls back to the format default', () => {
		assert.equal(getExportMimeType(undefined, 'pdf'), 'application/pdf');
		assert.equal(getExportMimeType('', 'markdown'), 'text/markdown');
	});
});

describe('decodeErrorBody', () => {
	it('parses a JSON error body sent as bytes', () => {
		const body = Buffer.from(JSON.stringify({ error: { message: 'Page not found', code: 404 } }));
		assert.deepEqual(decodeErrorBody(body), { error: { message: 'Page not found', code: 404 } });
	});

	it('parses an ArrayBuffer body', () => {
		const bytes = new TextEncoder().encode('{"error":{"message":"nope"}}');
		assert.deepEqual(decodeErrorBody(bytes.buffer), { error: { message: 'nope' } });
	});

	it('returns plain text when the body is not JSON', () => {
		assert.equal(decodeErrorBody(Buffer.from('Bad Gateway')), 'Bad Gateway');
	});

	it('leaves non-binary values untouched', () => {
		const parsed = { message: 'already parsed' };
		assert.equal(decodeErrorBody(parsed), parsed);
		assert.equal(decodeErrorBody(undefined), undefined);
	});
});
