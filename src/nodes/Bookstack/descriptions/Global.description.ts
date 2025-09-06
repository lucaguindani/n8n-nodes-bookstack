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
		options: [{ name: 'Global Search', value: 'search' }],
		default: 'search',
		description: 'The operation to perform on global resources',
	},
];

export const globalFields: INodeProperties[] = [
	{
		displayName: 'Search Query',
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
		placeholder: 'Enter search terms (e.g., kubernetes, docker)',
		description: 'Search query to find content across all resources. You can use filters like {type:page} to narrow results.',
	},
	{
		displayName: 'Content Type Filter',
		name: 'typeFilter',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		options: [
			{ name: 'All Types', value: 'all' },
			{ name: 'Books', value: 'book' },
			{ name: 'Pages', value: 'page' },
			{ name: 'Chapters', value: 'chapter' },
			{ name: 'Shelves', value: 'shelf' },
		],
		default: 'all',
		description: 'Filter search results by content type. This filter will be automatically added to your search query.',
	},
	{
		displayName: 'Return All Results',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: true,
		description: 'Whether to return all matching results or limit to a specific number of results',
	},
	{
		displayName: 'Results Limit',
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
		description: 'Maximum number of search results to return',
		placeholder: '100',
	},
	{
		displayName: 'Page Number',
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
		description: 'Page number for paginated results (starts from 1)',
		placeholder: '1',
	},
];
