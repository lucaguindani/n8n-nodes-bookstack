import { INodeProperties } from 'n8n-workflow';

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
			{ name: 'Get Many', value: 'getAll', action: 'Get many' },
			{ name: 'Get', value: 'get', action: 'Get' },
			{ name: 'Create', value: 'create', action: 'Create' },
			{ name: 'Update', value: 'update', action: 'Update' },
			{ name: 'Delete', value: 'delete', action: 'Delete' },
		],
		default: 'getAll',
	},
];

export const chapterFields: INodeProperties[] = [
	// ID field for Get, Update, Delete
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
		description: 'The unique identifier of the chapter',
		placeholder: 'Enter chapter ID (e.g., 101)',
	},
	// Fields for Create/Update
	{
		displayName: 'Book ID',
		name: 'book_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of the book this chapter belongs to',
		placeholder: 'Enter book ID',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chapter'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Name of the chapter',
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
		description: 'Description of the chapter',
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
		description: 'Comma-separated tags for the chapter',
		placeholder: 'tag1, tag2, tag3',
	},
];
