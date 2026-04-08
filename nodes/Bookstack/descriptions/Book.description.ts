import { INodeProperties } from 'n8n-workflow';
import { listOperations } from './ListOperations';

export const bookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['book'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a book (contains chapters and pages)' },
			{ name: 'Delete', value: 'delete', action: 'Delete a book' },
			{ name: 'Get', value: 'get', action: 'Get a single book by ID with its table of contents (chapters and pages listed, not full content)' },
			{ name: 'Get Many', value: 'getAll', action: 'List books (prefer Search to find books by keyword instead)' },
			{ name: 'Update', value: 'update', action: 'Update a book' },
		],
		default: 'getAll',
	},
];

export const bookFields: INodeProperties[] = [
	{
		displayName: 'Book ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'Numeric ID of the book. Use Search or Get Many to find book IDs.',
		placeholder: 'Enter book ID (e.g., 123)',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Book title (max 255 chars). If omitted, auto-generated from description or timestamp.',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New title for the book (max 255 chars). Leave empty to keep current name.',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Short description of the book (max 1900 chars). Shown in listings and search results.',
	},
	{
		displayName: 'Default Template ID',
		name: 'default_template_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of a page to use as the default template for new pages in this book.',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Comma-separated tags (e.g. "category:devops, status:active"). Tags enable search via {tag:name} syntax and are useful for categorization.',
	},
	...listOperations.map((op) => ({
		...op,
		displayOptions: {
			show: {
				...(op.displayOptions?.show ?? {}),
				resource: ['book'],
				operation: ['getAll'],
			},
		},
	})),
];
