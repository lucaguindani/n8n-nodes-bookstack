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
		options: [
			{ name: 'Search', value: 'search', action: 'Global search' },
			{ name: 'Audit Log', value: 'auditLogList', action: 'Audit log' },
		],
		default: 'search',
	},
];

export const globalFields: INodeProperties[] = [
	{
		displayName: 'Search Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'Enter search terms (e.g., kubernetes, docker)',
		description: 'Search query to find content across all resources',
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
			{ name: 'Chapters', value: 'chapter' },
			{ name: 'Pages', value: 'page' },
			{ name: 'Shelves', value: 'bookshelf' },
		],
		default: 'all',
		description:
			'Filter search results by content type. This filter will be automatically added to your search query.',
	},
	{
		displayName: 'Results Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		description: 'Max number of results to return',
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
			},
		},
		default: 1,
		typeOptions: {
			minValue: 1,
		},
		description: 'Page number for paginated results (starts from 1)',
		placeholder: '1',
	},
	{
		displayName: 'Limit',
		name: 'auditLimit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['auditLogList'],
			},
		},
		default: 50,
		typeOptions: { minValue: 1, maxValue: 500 },
		description: 'Maximum number of entries to return (max 500 per request)',
	},
	{
		displayName: 'Offset',
		name: 'auditOffset',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['auditLogList'],
			},
		},
		default: 0,
		typeOptions: { minValue: 0 },
		description: 'Starting offset for pagination',
	},
];
