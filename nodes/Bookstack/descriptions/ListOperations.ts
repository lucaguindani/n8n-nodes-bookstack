import { INodeProperties } from 'n8n-workflow';

export const listOperations: INodeProperties[] = [
	{
		displayName: 'Sort By',
		name: 'sortField',
		type: 'string',
		default: '',
		placeholder: 'name, created_at, updated_at, ...',
		description: 'Field name to sort by. Same fields available as for filtering (e.g. id, name, slug, created_at, updated_at, created_by).',
	},
	{
		displayName: 'Sort Direction',
		name: 'sortDirection',
		type: 'options',
		options: [
			{
				name: 'Ascending',
				value: 'asc',
			},
			{
				name: 'Descending',
				value: 'desc',
			},
		],
		default: 'asc',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		typeOptions: {
			multiple: true,
		},
		default: {},
		placeholder: 'Add Filter',
		options: [
			{
				name: 'filter',
				displayName: 'Filter',
				values: [
					{
						displayName: 'Field',
						name: 'field',
						type: 'string',
						default: '',
						description: 'Field name to filter on. Available fields depend on the resource. Common: id, name, slug, created_at, updated_at, created_by, updated_by, owned_by. Pages also support: book_id, chapter_id, draft, template, priority. Chapters also support: book_id, priority. Attachments/Images also support: uploaded_to.',
					},
					{
						displayName: 'Operation',
						name: 'operation',
						type: 'options',
						noDataExpression: true,
						options: [
							{ name: 'Equals', value: 'eq' },
							{ name: 'Greater Than', value: 'gt' },
							{ name: 'Greater Than or Equals', value: 'gte' },
							{ name: 'Less Than', value: 'lt' },
							{ name: 'Less Than or Equals', value: 'lte' },
							{ name: 'Like', value: 'like' },
							{ name: 'Not Equals', value: 'ne' },
						],
						default: 'eq',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to filter with',
					},
				],
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'WARNING: Fetches ALL items across all pages. On large BookStack instances with thousands of items this wastes massive amounts of tokens. Use Search (Global resource) to find specific items instead. Only enable for small, bounded datasets.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max items to return. Keep low (10-20) to save tokens. Use Search (Global resource) with keywords to find specific items instead of listing large numbers.',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
	},
];
