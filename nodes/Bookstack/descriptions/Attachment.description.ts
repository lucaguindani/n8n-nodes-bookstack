import { INodeProperties } from 'n8n-workflow';
import { listOperations } from './ListOperations';

export const attachmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create an attachment' },
			{ name: 'Delete', value: 'delete', action: 'Delete an attachment' },
			{ name: 'Get', value: 'get', action: 'Get an attachment' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many attachments' },
			{ name: 'Update', value: 'update', action: 'Update an attachment' },
		],
		default: 'getAll',
	},
];

export const attachmentFields: INodeProperties[] = [
	// ─── ID (get / update / delete) ──────────────────────────────────────────
	{
		displayName: 'Attachment ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The unique identifier of the attachment',
		placeholder: 'Enter attachment ID (e.g., 42)',
	},

	// ─── Name (create / update) ───────────────────────────────────────────────
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name for the attachment',
		placeholder: 'My attachment',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New name for the attachment. Leave empty to keep the existing name.',
		placeholder: 'My attachment',
	},

	// ─── Uploaded To / Page ID (create / update) ──────────────────────────────
	{
		displayName: 'Page ID',
		name: 'uploaded_to',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the page this attachment belongs to',
		placeholder: 'Enter page ID (e.g., 5)',
	},
	{
		displayName: 'Page ID',
		name: 'uploaded_to',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['update'],
			},
		},
		default: '',
		description:
			'ID of the page to move this attachment to. Leave empty to keep the existing page.',
		placeholder: 'Enter page ID (e.g., 5)',
	},

	// ─── Attachment Type (create / update) ────────────────────────────────────
	{
		displayName: 'Attachment Type',
		name: 'attachmentType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				name: 'File Upload',
				value: 'file',
				description: 'Upload a binary file as the attachment',
			},
			{
				name: 'External Link',
				value: 'link',
				description: 'Use an external URL as the attachment',
			},
		],
		default: 'file',
		description: 'Whether to upload a file or use an external link',
	},

	// ─── Binary Property (create / update — file type) ────────────────────────
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
				attachmentType: ['file'],
			},
		},
		default: 'data',
		description:
			'Name of the binary property containing the file to upload (e.g. the output of a previous HTTP Request node)',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['update'],
				attachmentType: ['file'],
			},
		},
		default: 'data',
		description:
			'Name of the binary property containing the new file to upload. Leave empty to keep the existing file.',
	},

	// ─── Link (create / update — link type) ───────────────────────────────────
	{
		displayName: 'Link URL',
		name: 'link',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
				attachmentType: ['link'],
			},
		},
		default: '',
		description: 'The external URL to use as the attachment target',
		placeholder: 'https://example.com/document.pdf',
	},
	{
		displayName: 'Link URL',
		name: 'link',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['update'],
				attachmentType: ['link'],
			},
		},
		default: '',
		description: 'The new external URL for the attachment. Leave empty to keep the existing link.',
		placeholder: 'https://example.com/document.pdf',
	},

	// ─── Include content (get) ───────────────────────────────────────────────
	{
		displayName: 'Include File Content',
		name: 'includeContent',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['get'],
			},
		},
		default: false,
		description: 'Whether to include the base64-encoded file content in the response',
	},

	// ─── List options (getAll) ────────────────────────────────────────────────
	...listOperations.map((prop) => ({
		...prop,
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['getAll'],
			},
		},
	})),
];
