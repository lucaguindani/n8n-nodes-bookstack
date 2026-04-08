import { INodeProperties } from 'n8n-workflow';
import { listOperations } from './ListOperations';

export const chapterOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['chapter'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a chapter' },
			{ name: 'Delete', value: 'delete', action: 'Delete a chapter' },
			{ name: 'Get', value: 'get', action: 'Get a chapter' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many chapters' },
			{ name: 'Update', value: 'update', action: 'Update a chapter' },
		],
		default: 'getAll',
	},
];

export const chapterFields: INodeProperties[] = [
	{
		displayName: 'Chapter ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'Numeric ID of the chapter. Get returns: id, name, slug, book_id, description, priority, created_at, updated_at, created_by, updated_by, tags[], and a "pages" array of {id, name, slug, book_id, chapter_id, priority}. Update returns the updated chapter. Delete returns empty on success.',
		placeholder: 'Enter chapter ID (e.g., 101)',
	},
	{
		displayName: 'Book ID',
		name: 'book_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the book this chapter belongs to.',
		placeholder: 'Enter book ID',
	},
	{
		displayName: 'Book ID',
		name: 'book_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the parent book. Set this to MOVE the chapter to a different book.',
		placeholder: 'Enter book ID',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Chapter title (max 255 chars). The AI should generate a concise, descriptive title. If omitted, auto-generated from description or timestamp.',
		placeholder: 'Enter chapter name',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New title for the chapter (max 255 chars). Leave empty to keep current name.',
		placeholder: 'Enter chapter name',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Short description of the chapter (max 1900 chars). Shown in listings and search results.',
		placeholder: 'Enter chapter description',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Comma-separated tags (e.g. "networking, reviewed"). On update, this REPLACES all existing tags. Tags are searchable via {tag:tagname} in Global Search.',
		placeholder: 'tag1, tag2, tag3',
	},
	...listOperations.map((op) => ({
		...op,
		displayOptions: {
			show: {
				...(op.displayOptions?.show ?? {}),
				resource: ['chapter'],
				operation: ['getAll'],
			},
		},
	})),
];
