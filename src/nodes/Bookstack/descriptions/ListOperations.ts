import { INodeProperties } from 'n8n-workflow';

export const listOperations: INodeProperties[] = [
    {
        displayName: 'Sort By',
        name: 'sortField',
        type: 'string',
        default: '',
        placeholder: 'name',
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
                            { name: 'Not Equals', value: 'ne' },
                            { name: 'Greater Than', value: 'gt' },
                            { name: 'Less Than', value: 'lt' },
                            { name: 'Greater Than or Equals', value: 'gte' },
                            { name: 'Less Than or Equals', value: 'lte' },
                            { name: 'Like', value: 'like' },
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
        displayName: 'Count',
        name: 'count',
        type: 'number',
        typeOptions: {
            minValue: 1,
            maxValue: 500,
        },
        default: 100,
        description: 'Max number of results to return',
    },
    {
        displayName: 'Offset',
        name: 'offset',
        type: 'number',
        typeOptions: {
            minValue: 0,
        },
        default: 0,
        description: 'Offset of results to return',
    },
];
