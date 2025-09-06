import { INodeProperties } from 'n8n-workflow';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Books', value: 'book' },
		{ name: 'Pages', value: 'page' },
		{ name: 'Shelves', value: 'shelf' },
		{ name: 'Chapters', value: 'chapter' },
		{ name: 'Global Search', value: 'global' },
	],
	default: 'global',
	description: 'The BookStack resource to work with',
};
