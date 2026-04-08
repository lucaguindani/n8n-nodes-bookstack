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
			{ name: 'Create', value: 'create', action: 'Create a book' },
			{ name: 'Delete', value: 'delete', action: 'Delete a book' },
			{ name: 'Get', value: 'get', action: 'Get a book' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many books' },
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
		description: 'Numeric ID of the book. Get returns: id, name, slug, description, created_at, updated_at, created_by, updated_by, owned_by, tags[], and a "contents" array of {id, name, type, pages[]} for chapters and direct pages. Update returns the updated book. Delete returns empty on success.',
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
		description: 'Book title (max 255 chars). The AI should generate a concise, descriptive title. If omitted, auto-generated from description or timestamp.',
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
		description: 'Comma-separated tags (e.g. "devops, infrastructure, active"). On update, this REPLACES all existing tags. Tags are searchable via {tag:tagname} in Global Search.',
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
