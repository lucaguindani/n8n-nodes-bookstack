import { INodeProperties } from 'n8n-workflow';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Book', value: 'book' },
		{ name: 'Chapter', value: 'chapter' },
		{ name: 'Global', value: 'global' },
		{ name: 'Image', value: 'image' },
		{ name: 'Page', value: 'page' },
		{ name: 'Shelf', value: 'shelf' },
	],
	default: 'global',
	description: 'The BookStack resource to work with',
};
