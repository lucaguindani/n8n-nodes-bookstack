import { INodeProperties } from 'n8n-workflow';
import { listOperations } from './ListOperations';

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a comment' },
			{ name: 'Delete', value: 'delete', action: 'Delete a comment' },
			{ name: 'Get', value: 'get', action: 'Get a comment' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many comments' },
			{ name: 'Update', value: 'update', action: 'Update a comment' },
		],
		default: 'getAll',
	},
];

export const commentFields: INodeProperties[] = [
	// Comment ID field for get, update, delete operations
	{
		displayName: 'Comment ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The unique identifier of the comment',
		placeholder: 'Enter comment ID (e.g., 22)',
	},

	// Fields for Create operation
	{
		displayName: 'Page ID',
		name: 'page_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the page to comment on',
		placeholder: 'Enter page ID (e.g., 2040)',
	},
	{
		displayName: 'HTML Content',
		name: 'html',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'HTML content of the comment wrapped with a &lt;p&gt; tag',
		placeholder: 'Enter HTML content',
	},
	{
		displayName: 'Reply To',
		name: 'reply_to',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the comment being replied to (leave empty for top-level comment)',
		placeholder: 'Enter ID of parent comment',
	},

	// Fields for Update operation
	{
		displayName: 'HTML Content',
		name: 'html',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Updated HTML content of the comment wrapped with a &lt;p&gt; tag',
	},
	{
		displayName: 'Archived',
		name: 'archived',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether to archive the comment (only for top-level comments)',
	},
	// ─── List options (getAll) ────────────────────────────────────────────────
	...listOperations.map((prop) => ({
		...prop,
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getAll'],
			},
		},
	})),
];
