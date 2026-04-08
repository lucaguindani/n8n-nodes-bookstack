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
		placeholder: 'Enter search terms',
		description:
			'Search terms to find content. Each result contains: id, name, type (page/book/chapter/bookshelf), url, preview (short text snippet), tags[], book, chapter. Does NOT return full page content - use Get by ID for that. Use the Content Type Filter below instead of adding {type:...} to the query. Additional inline filters: {in_name:text}, {in_body:text}, {tag:tagname}, {created_by:id}, {updated_by:id}. Example: "networking {in_name:setup}". An empty result list means no matches were found.',
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
			'Filter by content type. Automatically appended to the query - do NOT also add {type:...} manually. Use "Pages" to find pages, "Books" for books, etc.',
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
		description: 'WARNING: On large BookStack instances this can return thousands of results. Use a low limit instead and refine your search query. Only enable if you are certain the result set is small.',
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
		description: 'Max results to return. Keep this low (5-20) when searching to save tokens. You can always search again with different terms if needed.',
		placeholder: '20',
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
			'WARNING: Fetches FULL content for every search result (1 extra API call per result). With 50 results this means 50 additional requests and massive token usage. Only use with a small limit (5-10) when you need to compare content. Prefer: search with low limit, then Get individual pages by ID.',
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
