import { INodeProperties } from 'n8n-workflow';

export const globalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['global'],
			},
		},
		options: [{ name: 'Search', value: 'search' }],
		default: 'search',
		description: 'The operation to perform',
	},
];

export const globalFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: '',
		required: true,
		placeholder: 'kubernetes',
		description: 'Search query. Use {type:page}, {type:book}, {type:chapter}, or {type:shelf} to filter by type.',
	},
	{
		displayName: 'Type Filter',
		name: 'typeFilter',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		options: [
			{ name: 'All', value: 'all' },
			{ name: 'Book', value: 'book' },
			{ name: 'Page', value: 'page' },
			{ name: 'Chapter', value: 'chapter' },
			{ name: 'Shelf', value: 'shelf' },
		],
		default: 'all',
		description: 'Filter results by content type (will be added to your query automatically)',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: true,
		description: 'Whether to return all results or limit to a specific number',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		default: 100,
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		description: 'Maximum number of results to return',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		default: 1,
		typeOptions: {
			minValue: 1,
		},
		description: 'Page number to retrieve (starts from 1)',
	},
];
