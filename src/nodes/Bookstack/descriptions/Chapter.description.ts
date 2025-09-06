import { INodeProperties } from 'n8n-workflow';

export const chapterOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    options: [
      { name: 'Get All', value: 'getAll' },
      { name: 'Get', value: 'get' },
      { name: 'Create', value: 'create' },
      { name: 'Update', value: 'update' },
      { name: 'Delete', value: 'delete' },
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
    description: 'The ID of the chapter.',
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
    description: 'ID of the book this chapter belongs to.',
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
    description: 'Name of the chapter.',
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
    description: 'Description of the chapter.',
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
    description: 'Comma-separated tags for the chapter.',
  },
];
