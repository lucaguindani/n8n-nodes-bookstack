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
			{ name: 'Create', value: 'create', action: 'Create' },
			{ name: 'Delete', value: 'delete', action: 'Delete' },
			{ name: 'Get', value: 'get', action: 'Get' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many' },
			{ name: 'Update', value: 'update', action: 'Update' },
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
		description: 'The unique identifier of the shelf',
		placeholder: 'Enter shelf ID (e.g., 789)',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['shelf'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the shelf (max 255 characters)',
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
		description: 'Name of the shelf (max 255 characters)',
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
		description: 'Description of the shelf (max 1900 characters)',
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
