import { INodeProperties } from 'n8n-workflow';

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
			{ name: 'Get All', value: 'getAll' },
			{ name: 'Get', value: 'get' },
			{ name: 'Create', value: 'create' },
			{ name: 'Update', value: 'update' },
			{ name: 'Delete', value: 'delete' },
		],
		default: 'getAll',
		description: 'The operation to perform on shelves',
	},
];

export const shelfFields: INodeProperties[] = [
	// ID field for Get, Update, Delete
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
		description: 'The unique identifier of the shelf',
		placeholder: 'Enter shelf ID (e.g., 789)',
	},
	// Fields for Create/Update
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Name of the shelf',
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
		description: 'Description of the shelf',
		placeholder: 'Enter shelf description',
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
		description: 'Comma-separated tags for the shelf',
		placeholder: 'tag1, tag2, tag3',
	},
];
