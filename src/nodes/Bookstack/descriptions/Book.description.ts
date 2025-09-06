import { INodeProperties } from 'n8n-workflow';

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
			{ name: 'Get All', value: 'getAll' },
			{ name: 'Get', value: 'get' },
			{ name: 'Create', value: 'create' },
			{ name: 'Update', value: 'update' },
			{ name: 'Delete', value: 'delete' },
		],
		default: 'getAll',
		description: 'The operation to perform on books',
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
		description: 'Name of the book.',
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
		description: 'Description of the book.',
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
		description: 'Comma-separated tags for the book.',
	},
];
