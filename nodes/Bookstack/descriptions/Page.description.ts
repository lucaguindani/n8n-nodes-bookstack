import { INodeProperties } from 'n8n-workflow';
import { listOperations } from './ListOperations';

export const pageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['page'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a page' },
			{ name: 'Delete', value: 'delete', action: 'Delete a page' },
			{ name: 'Get', value: 'get', action: 'Get a page' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many pages' },
			{ name: 'Update', value: 'update', action: 'Update a page' },
		],
		default: 'getAll',
	},
];

export const pageFields: INodeProperties[] = [
	{
		displayName: 'Page ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'Numeric ID of the page. Get returns: id, name, slug, html, markdown, book_id, chapter_id, priority, created_at, updated_at, created_by, updated_by, tags[]. Update returns the updated page. Delete returns an empty response on success.',
		placeholder: 'Enter page ID (e.g., 456)',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Page title (max 255 chars). The AI should generate a concise, descriptive title from the content. If omitted, auto-generated from content. On success, returns the created page with its new id, name, slug, book_id, chapter_id.',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New title for the page (max 255 chars). Leave empty to keep current name.',
	},
	{
		displayName: 'Book ID',
		name: 'book_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of the parent book. On create: set EITHER book_id OR chapter_id (not both). On update: set this to MOVE the page to a different book (removes it from its current chapter).',
	},
	{
		displayName: 'Chapter ID',
		name: 'chapter_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of the parent chapter. On create: set EITHER chapter_id OR book_id (not both). On update: setting chapter_id alone moves the page into that chapter (no need to clear book_id).',
	},
	{
		displayName: 'HTML Content',
		name: 'html',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'HTML body of the page. Only use if markdown is not suitable - markdown uses ~3x fewer tokens. Required on create if markdown is not set. On update, REPLACES the entire page content. Do NOT set both html and markdown.',
	},
	{
		displayName: 'Markdown Content',
		name: 'markdown',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Markdown body of the page. PREFERRED over HTML - uses ~3x fewer tokens. Required on create if html is not set. On update, REPLACES the entire page content. To append, first Get the page, merge content, then Update. Do NOT set both html and markdown.',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Comma-separated tags (e.g. "networking, docker, reviewed"). On update, this REPLACES all existing tags. Tags are searchable via {tag:tagname} in Global Search.',
	},
	...listOperations.map((op) => ({
		...op,
		displayOptions: {
			show: {
				...(op.displayOptions?.show ?? {}),
				resource: ['page'],
				operation: ['getAll'],
			},
		},
	})),
];
