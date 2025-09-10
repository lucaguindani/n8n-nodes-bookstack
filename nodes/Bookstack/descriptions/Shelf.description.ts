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
			{ name: 'Get Many', value: 'getAll', action: 'Get many' },
			{ name: 'Get', value: 'get', action: 'Get' },
			{ name: 'Create', value: 'create', action: 'Create' },
			{ name: 'Update', value: 'update', action: 'Update' },
			{ name: 'Delete', value: 'delete', action: 'Delete' },
		],
		default: 'getAll',
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
		description: 'Comma-separated list of book IDs to add to this shelf',
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
		description: 'Comma-separated tags for the shelf',
		placeholder: 'tag1, tag2, tag3',
	},
	...listOperations.map((op) => ({
		...op,
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['getAll'],
			},
		},
	})),
];
