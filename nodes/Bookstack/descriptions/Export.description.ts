import { INodeProperties } from 'n8n-workflow';

export const exportFields: INodeProperties[] = [
	{
		displayName: 'Format',
		name: 'exportFormat',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['book', 'chapter', 'page'],
				operation: ['export'],
			},
		},
		options: [
			{ name: 'HTML', value: 'html' },
			{ name: 'Markdown', value: 'markdown' },
			{ name: 'PDF', value: 'pdf' },
			{ name: 'Plain Text', value: 'plaintext' },
			{ name: 'ZIP', value: 'zip' },
		],
		default: 'html',
		description: 'File format of the export',
	},
	{
		displayName: 'Put Output File in Field',
		name: 'exportBinaryProperty',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['book', 'chapter', 'page'],
				operation: ['export'],
			},
		},
		default: 'data',
		hint: 'The name of the output binary field to put the file in',
	},
];
