import { INodeProperties } from 'n8n-workflow';
import { listOperations } from './ListOperations';

export const shelfOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['shelf'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a shelf (top-level container for books)' },
			{ name: 'Delete', value: 'delete', action: 'Delete a shelf' },
			{ name: 'Get', value: 'get', action: 'Get a single shelf by ID with its list of books (use after Search)' },
			{ name: 'Get Many', value: 'getAll', action: 'List shelves (prefer Search to find shelves by keyword instead)' },
			{ name: 'Update', value: 'update', action: 'Update a shelf' },
		],
		default: 'getAll',
	},
];

export const shelfFields: INodeProperties[] = [
	{
		displayName: 'Shelf ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'Numeric ID of the shelf. Use Search or Get Many to find shelf IDs.',
		placeholder: 'Enter shelf ID (e.g., 789)',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Shelf title (max 255 chars). If omitted, auto-generated from description or timestamp.',
		placeholder: 'Enter shelf name',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New title for the shelf (max 255 chars). Leave empty to keep current name.',
		placeholder: 'Enter shelf name',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Short description of the shelf (max 1900 chars). Shown in listings and search results.',
		placeholder: 'Enter shelf description',
	},
	{
		displayName: 'Books',
		name: 'books',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Comma-separated list of book IDs to assign to this shelf (e.g. "1,5,12"). Replaces the current book list on update.',
		placeholder: '123,456,789',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Comma-separated tags (e.g. "area:infrastructure, status:active"). Tags enable search via {tag:name} syntax.',
		placeholder: 'tag1, tag2, tag3',
	},
	...listOperations.map((op) => ({
		...op,
		displayOptions: {
			show: {
				...(op.displayOptions?.show ?? {}),
				resource: ['shelf'],
				operation: ['getAll'],
			},
		},
	})),
];
