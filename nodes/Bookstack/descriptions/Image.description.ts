import { INodeProperties } from 'n8n-workflow';
import { listOperations } from './ListOperations';

export const imageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['image'],
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

export const imageFields: INodeProperties[] = [
	// ─── ID (get / update / delete) ───────────────────────────────────────────
	{
		displayName: 'Image ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The unique identifier of the image',
		placeholder: 'Enter image ID (e.g., 42)',
	},

	// ─── Uploaded To (create) ─────────────────────────────────────────────────
	{
		displayName: 'Page ID',
		name: 'uploaded_to',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the page this image is attached to',
		placeholder: 'Enter page ID (e.g., 5)',
	},

	// ─── Binary Property (create / update) ────────────────────────────────────
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['create'],
			},
		},
		default: 'data',
		description:
			'Name of the binary property containing the image file to upload (e.g. the output of a previous HTTP Request node)',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['update'],
			},
		},
		default: 'data',
		description:
			'Name of the binary property containing the image file to upload (e.g. the output of a previous HTTP Request node). Leave empty to keep the existing image.',
	},

	// ─── Name (create / update) ───────────────────────────────────────────────
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Custom name for the image. If left empty on create, the filename will be used.',
		placeholder: 'My image name',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Custom name for the image. Leave empty to keep the existing filename.',
		placeholder: 'My image name',
	},

	// ─── List options (getAll) ────────────────────────────────────────────────
	...listOperations.map((prop) => ({
		...prop,
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['getAll'],
			},
		},
	})),
];
