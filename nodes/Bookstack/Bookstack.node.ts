import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';

import { bookOperations, bookFields } from './descriptions/Book.description';
import { pageOperations, pageFields } from './descriptions/Page.description';
import { shelfOperations, shelfFields } from './descriptions/Shelf.description';
import { chapterOperations, chapterFields } from './descriptions/Chapter.description';
import { globalOperations, globalFields } from './descriptions/Global.description';
import { resourceProperty } from './descriptions/ResourceProperty';
import { bookstackApiRequest, validateRequiredParameters } from './utils/BookstackApiHelpers';
import { IBookstackFilters } from './types/BookstackTypes';

export class Bookstack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BookStack',
		name: 'bookstack',
		icon: { light: 'file:../../icons/bookstack.svg', dark: 'file:../../icons/bookstack.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage BookStack resources',
		defaults: { name: 'Bookstack' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'bookstackApi',
				required: true,
			},
		],
		properties: [
			resourceProperty,
			...bookOperations,
			...bookFields,
			...pageOperations,
			...pageFields,
			...shelfOperations,
			...shelfFields,
			...chapterOperations,
			...chapterFields,
			...globalOperations,
			...globalFields,
		],
	};

	private readonly resourceEndpoints: Record<string, string> = {
		book: 'books',
		page: 'pages',
		shelf: 'shelves',
		chapter: 'chapters',
	};

	private readonly resourceFields: Record<string, string[]> = {
		book: ['name', 'description', 'tags', 'default_template_id'],
		page: ['name', 'html', 'markdown', 'book_id', 'chapter_id', 'tags'],
		chapter: ['name', 'description', 'book_id', 'tags'],
		shelf: ['name', 'description', 'books', 'tags'],
	};

	private buildRequestBody(
		context: IExecuteFunctions,
		resource: string,
		itemIndex: number,
	): IDataObject {
		const body: IDataObject = {};
		const fields = this.resourceFields[resource];

		for (const field of fields) {
			const value = context.getNodeParameter(field, itemIndex, undefined);
			if (value !== undefined && value !== '') {
				body[field] = value;
			}
		}

		// Convert tags to array format
		if (body.tags && typeof body.tags === 'string') {
			body.tags = body.tags.split(',').map((t: string) => ({ name: t.trim() }));
		}

		// Convert books to array of integers
		if (body.books && typeof body.books === 'string') {
			body.books = body.books
				.split(',')
				.map((id: string) => parseInt(id.trim(), 10))
				.filter((id: number) => !isNaN(id));
		}

		return body;
	}

	private validatePageCreation(
		body: IDataObject,
		context: IExecuteFunctions,
		itemIndex: number,
	): void {
		if (!body.book_id && !body.chapter_id) {
			throw new NodeOperationError(
				context.getNode(),
				'Either book_id or chapter_id must be provided when creating a page',
				{ itemIndex },
			);
		}

		if (!body.html && !body.markdown) {
			throw new NodeOperationError(
				context.getNode(),
				'Either html or markdown content must be provided when creating a page',
				{ itemIndex },
			);
		}
	}

	private buildQueryParameters(context: IExecuteFunctions, itemIndex: number): IDataObject {
		const count = context.getNodeParameter('count', itemIndex) as number;
		const offset = context.getNodeParameter('offset', itemIndex) as number;
		const sortField = context.getNodeParameter('sortField', itemIndex) as string;
		const sortDirection = context.getNodeParameter('sortDirection', itemIndex) as string;
		const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;

		const qs: IDataObject = { count, offset };

		if (sortField) {
			qs.sort = sortDirection === 'desc' ? `-${sortField}` : `+${sortField}`;
		}

		if (filters.filter) {
			const filterArray = Array.isArray(filters.filter) ? filters.filter : [filters.filter];
			filterArray.forEach((filter: IBookstackFilters) => {
				if (!filter?.field) return;
				const op = (filter.operation || 'eq').toString();
				const opPart = op !== 'eq' ? `:${op}` : '';
				qs[`filter[${filter.field}${opPart}]`] = filter.value;
			});
		}

		return qs;
	}

	private async handleSearchOperation(context: IExecuteFunctions, itemIndex: number) {
		let query = context.getNodeParameter('query', itemIndex) as string;
		const typeFilter = context.getNodeParameter('typeFilter', itemIndex) as string;
		const limit = context.getNodeParameter('limit', itemIndex, 100) as number;
		const page = context.getNodeParameter('page', itemIndex, 1) as number;

		validateRequiredParameters(context.getNode(), { query }, ['query']);

		if (typeFilter && typeFilter !== 'all') {
			query += ` {type:${typeFilter}}`;
		}

		const qs = {
			query,
			count: Math.min(limit, 500),
			page,
		};

		try {
			const searchResponse = await bookstackApiRequest.call(context, 'GET', '/search', {}, qs);
			return searchResponse.data.length ? searchResponse : searchResponse.data;
		} catch (error) {
			throw new NodeOperationError(context.getNode(), error.message, { itemIndex });
		}
	}

	private async handleAuditLogOperation(context: IExecuteFunctions, itemIndex: number) {
		const limit = context.getNodeParameter('auditLimit', itemIndex, 50) as number;
		const offset = context.getNodeParameter('auditOffset', itemIndex, 0) as number;

		const qs = { count: Math.min(limit, 500), offset };
		const res = await bookstackApiRequest.call(context, 'GET', '/audit-log', {}, qs);
		return res?.data ?? res;
	}

	private async handleGetAllOperation(
		context: IExecuteFunctions,
		endpoint: string,
		itemIndex: number,
	) {
		const qs = this.buildQueryParameters(context, itemIndex);
		const fullEndpoint = `/${endpoint}`;

		const response = await bookstackApiRequest.call(context, 'GET', fullEndpoint, {}, qs);
		return response.data.length ? response : response.data;
	}

	private async handleGetOperation(
		context: IExecuteFunctions,
		endpoint: string,
		itemIndex: number,
	) {
		const id = context.getNodeParameter('id', itemIndex) as string;
		return await bookstackApiRequest.call(context, 'GET', `/${endpoint}/${id}`, {}, {});
	}

	private async handleCreateOperation(
		context: IExecuteFunctions,
		resource: string,
		endpoint: string,
		itemIndex: number,
	) {
		const body = this.buildRequestBody(context, resource, itemIndex);

		if (resource === 'page') {
			this.validatePageCreation(body, context, itemIndex);
		}

		return await bookstackApiRequest.call(context, 'POST', `/${endpoint}`, body, {});
	}

	private async handleUpdateOperation(
		context: IExecuteFunctions,
		resource: string,
		endpoint: string,
		itemIndex: number,
	) {
		const id = context.getNodeParameter('id', itemIndex) as string;
		const body = this.buildRequestBody(context, resource, itemIndex);

		return await bookstackApiRequest.call(context, 'PUT', `/${endpoint}/${id}`, body, {});
	}

	private async handleDeleteOperation(
		context: IExecuteFunctions,
		endpoint: string,
		itemIndex: number,
	) {
		const id = context.getNodeParameter('id', itemIndex) as string;
		return await bookstackApiRequest.call(context, 'DELETE', `/${endpoint}/${id}`, {}, {});
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const nodeInstance = new Bookstack();

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData;

				if (resource === 'global') {
					if (operation === 'search') {
						responseData = await nodeInstance.handleSearchOperation(this, i);
					} else if (operation === 'auditLogList') {
						responseData = await nodeInstance.handleAuditLogOperation(this, i);
					}
				} else if (['book', 'page', 'shelf', 'chapter'].includes(resource)) {
					const endpoint = nodeInstance.resourceEndpoints[resource];

					switch (operation) {
						case 'getAll':
							responseData = await nodeInstance.handleGetAllOperation(this, endpoint, i);
							break;
						case 'get':
							responseData = await nodeInstance.handleGetOperation(this, endpoint, i);
							break;
						case 'create':
							responseData = await nodeInstance.handleCreateOperation(this, resource, endpoint, i);
							break;
						case 'update':
							responseData = await nodeInstance.handleUpdateOperation(this, resource, endpoint, i);
							break;
						case 'delete':
							responseData = await nodeInstance.handleDeleteOperation(this, endpoint, i);
							break;
					}
				}

				if (Array.isArray(responseData)) {
					responseData.forEach((item: JsonObject) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else if (responseData !== undefined) {
					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				throw new NodeOperationError(this.getNode(), error.message || error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
