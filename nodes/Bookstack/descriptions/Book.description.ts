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
			{ name: 'Create', value: 'create', action: 'Create' },
			{ name: 'Delete', value: 'delete', action: 'Delete' },
			{ name: 'Get', value: 'get', action: 'Get' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many' },
			{ name: 'Update', value: 'update', action: 'Update' },
		],
		default: 'getAll',
	},
];

export const bookFields: INodeProperties[] = [
	// ID field for Get, Update, Delete
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
		description: 'The unique identifier of the book',
		placeholder: 'Enter book ID (e.g., 123)',
	},
	// Fields for Create/Update
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Name of the book',
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
		description: 'Description of the book',
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
		description: 'ID of the default template for pages in this book',
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
		description: 'Comma-separated tags for the book',
	},
	...listOperations.map((op) => ({
		...op,
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['getAll'],
			},
		},
	})),
];
