export const shelfOperations = [
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

export const shelfFields = [
  // ID field for Get, Update, Delete
  {
    displayName: 'Shelf ID',
    name: 'id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['shelf'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: '',
    description: 'The ID of the shelf.',
  },
  // Fields for Create/Update
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['shelf'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Name of the shelf.',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['shelf'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Description of the shelf.',
  },
  {
    displayName: 'Tags',
    name: 'tags',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['shelf'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Comma-separated tags for the shelf.',
  },
];
