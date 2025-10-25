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
		name: 'searchQuery',
		type: 'string',
		required: true,
		requiresDataPath: 'single',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: '',
		typeOptions: {
			aiSupported: true,
		},
		placeholder: 'Enter search terms (e.g., kubernetes, docker)',
		description:
			'Search query to find content across all resources (books, pages, chapters, shelves)',
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
		displayName: 'Return All',
		name: 'returnAllSearch',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
				returnAllSearch: [false],
			},
		},
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'Max number of results to return',
		placeholder: '100',
	},
	{
		displayName: 'Deep Dive',
		name: 'deepDive',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['search'],
			},
		},
		default: false,
		description:
			'Whether to automatically retrieve full content for all found pages, chapters, books and shelves. This provides more context but may increase execution time.',
	},
	{
		displayName: 'Return All',
		name: 'returnAllAudit',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['auditLogList'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'auditLimit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['global'],
				operation: ['auditLogList'],
				returnAllAudit: [false],
			},
		},
		default: 50,
		typeOptions: { minValue: 1, maxValue: 500 },
		description: 'Maximum number of entries to return (max 500 per request)',
	},
];
