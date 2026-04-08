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
			{ name: 'Create', value: 'create', action: 'Create a page in a book or chapter (prefer markdown over html)' },
			{ name: 'Delete', value: 'delete', action: 'Delete a page' },
			{ name: 'Get', value: 'get', action: 'Get a single page by ID with full content (use after Search to read specific pages)' },
			{ name: 'Get Many', value: 'getAll', action: 'List pages (WARNING: use Search instead to find pages - Get Many on large instances wastes tokens)' },
			{ name: 'Update', value: 'update', action: 'Update a page or move it to another book/chapter' },
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
		description: 'Numeric ID of the page. Use Search or Get Many to find page IDs.',
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
		description: 'Page title (max 255 chars). If omitted, auto-generated from the first heading or first line of content.',
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
		description: 'ID of the parent book. Required on create if chapter_id is not set. On update, set this to MOVE the page to a different book.',
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
		description: 'ID of the parent chapter. Required on create if book_id is not set. On update, set this to MOVE the page into a different chapter.',
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
		description: 'HTML body of the page. Only use this if markdown is not suitable. Prefer markdown over HTML - it uses fewer tokens and is more efficient for AI processing. Required on create if markdown is not set. Do NOT set both html and markdown.',
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
		description: 'Markdown body of the page. PREFERRED over HTML - uses ~3x fewer tokens and is more efficient for AI processing. Required on create if html is not set. Do NOT set both html and markdown.',
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
		description: 'Comma-separated tags (e.g. "topic:networking, status:reviewed"). Tags enable search via {tag:name} syntax and are useful for AI categorization.',
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
