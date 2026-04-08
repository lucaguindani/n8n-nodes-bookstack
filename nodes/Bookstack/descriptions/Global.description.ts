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
			{ name: 'Search', value: 'search', action: 'Search all content - use this first to find or locate content before creating or moving' },
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
		placeholder: 'Enter search terms',
		description:
			'Search terms to find content across books, pages, chapters, and shelves. Supports advanced filters: {type:page}, {in_name:text}, {in_body:text}, {tag:tagname}, {tag:name=value}, {created_by:id}, {updated_by:id}. Use this as the first step to find where content belongs before creating or moving.',
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
			'Automatically retrieve full content for all results. Provides complete text, children lists, and metadata. Enable this when you need to compare content or check for duplicates. Increases API calls proportionally to result count.',
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
