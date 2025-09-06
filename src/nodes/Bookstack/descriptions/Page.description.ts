export const pageOperations = [
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

export const pageFields = [
  // ID field for Get, Update, Delete
  {
    displayName: 'Page ID',
    name: 'id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: '',
    description: 'The ID of the page.',
  },
  // Fields for Create/Update
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Name of the page.',
  },
  {
    displayName: 'Book ID',
    name: 'book_id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'ID of the book this page belongs to.',
  },
  {
    displayName: 'Chapter ID',
    name: 'chapter_id',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'ID of the chapter this page belongs to (optional).',
  },
  {
    displayName: 'HTML Content',
    name: 'html',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'HTML content of the page.',
  },
  {
    displayName: 'Tags',
    name: 'tags',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Comma-separated tags for the page.',
  },
];
