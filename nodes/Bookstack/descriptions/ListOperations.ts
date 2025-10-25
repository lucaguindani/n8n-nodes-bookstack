import { INodeProperties } from 'n8n-workflow';

export const listOperations: INodeProperties[] = [
	{
		displayName: 'Sort By',
		name: 'sortField',
		type: 'string',
		default: '',
		placeholder: 'name, created_at, updated_at, ...',
		description: 'Field to sort by',
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
						description: 'Field to filter on',
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
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
	},
];
