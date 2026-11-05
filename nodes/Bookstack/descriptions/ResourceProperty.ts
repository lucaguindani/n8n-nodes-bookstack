import { INodeProperties } from 'n8n-workflow';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Attachment', value: 'attachment' },
		{ name: 'Book', value: 'book' },
		{ name: 'Chapter', value: 'chapter' },
		{ name: 'Comment', value: 'comment' },
		{ name: 'Global', value: 'global' },
		{ name: 'Image', value: 'image' },
		{ name: 'Page', value: 'page' },
		{ name: 'Shelf', value: 'shelf' },
	],
	default: 'global',
	description: 'The BookStack resource to work with',
};

export const versionCheckProperty: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	options: [
		{
			displayName: 'Skip Version Check',
			name: 'skipVersionCheck',
			type: 'boolean',
			default: false,
			description: 'Whether to skip checking that the BookStack version supports the operation',
		},
	],
};
