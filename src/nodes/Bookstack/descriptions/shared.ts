import { INodeProperties } from 'n8n-workflow';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	options: [
		{ name: 'Book', value: 'book' },
		{ name: 'Page', value: 'page' },
		{ name: 'Shelf', value: 'shelf' },
		{ name: 'Chapter', value: 'chapter' },
		{ name: 'Global', value: 'global' },
	],
	default: 'global',
};
