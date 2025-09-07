import { INodeProperties } from 'n8n-workflow';

export const pageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['page'],
			},
		},
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many' },
			{ name: 'Get', value: 'get', action: 'Get' },
			{ name: 'Create', value: 'create', action: 'Create' },
			{ name: 'Update', value: 'update', action: 'Update' },
			{ name: 'Delete', value: 'delete', action: 'Delete' },
			{ name: 'Export', value: 'export', action: 'Export page content' },
		],
		default: 'getAll',
	},
];

export const pageFields: INodeProperties[] = [
	// ID field for Get, Update, Delete, Export
	{
		displayName: 'Page ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['get', 'update', 'delete', 'export'],
			},
		},
		default: '',
		description: 'The unique identifier of the page',
		placeholder: 'Enter page ID (e.g., 456)',
	},
	// Fields for Create/Update
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Name of the page',
	},
	{
		displayName: 'Book ID',
		name: 'book_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of the book this page belongs to',
	},
	{
		displayName: 'Chapter ID',
		name: 'chapter_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of the chapter this page belongs to (optional)',
	},
	{
		displayName: 'HTML Content',
		name: 'html',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'HTML content of the page',
	},
	{
		displayName: 'Markdown Content',
		name: 'markdown',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Markdown content of the page. If provided, this will be used instead of HTML content.',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Comma-separated tags for the page'
	},
	// Export fields
	{
		displayName: 'Format',
		name: 'exportFormat',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['export'],
			},
		},
		options: [
			{ name: 'HTML', value: 'html' },
			{ name: 'PDF', value: 'pdf' },
			{ name: 'Plain Text', value: 'plain-text' },
			{ name: 'Markdown', value: 'markdown' },
			{ name: 'ZIP', value: 'zip' },
		],
		default: 'html',
		description: 'Export format for the page content',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['export'],
			},
		},
		default: 'data',
		description: 'Name of the binary property to set on the output',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['export'],
			},
		},
		default: '',
		placeholder: 'page-ID.pdf',
		description: 'File name (with extension). If empty, a name will be generated automatically.'
	},
];
