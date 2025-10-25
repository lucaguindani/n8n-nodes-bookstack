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
			{ name: 'Create', value: 'create', action: 'Create' },
			{ name: 'Delete', value: 'delete', action: 'Delete' },
			{ name: 'Get', value: 'get', action: 'Get' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many' },
			{ name: 'Update', value: 'update', action: 'Update' },
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
		description: 'The unique identifier of the page',
		placeholder: 'Enter page ID (e.g., 456)',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the page (max 255 characters)',
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
		description: 'Name of the page (max 255 characters)',
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
		description: 'ID of the book this page belongs to (required on create if no Chapter ID)',
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
		description: 'ID of the chapter this page belongs to (required on create if no Book ID)',
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
		description: 'HTML content of the page (required on create if no Markdown Content)',
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
		description: 'Markdown content of the page (required on create if no HTML Content)',
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
		description: 'Comma-separated tags for the page',
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
