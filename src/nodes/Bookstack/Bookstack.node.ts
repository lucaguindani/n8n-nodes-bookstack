import { IExecuteFunctions } from 'n8n-workflow';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { bookOperations, bookFields } from './descriptions/Book.description';
import { pageOperations, pageFields } from './descriptions/Page.description';
import { shelfOperations, shelfFields } from './descriptions/Shelf.description';
import { chapterOperations, chapterFields } from './descriptions/Chapter.description';
import { globalOperations, globalFields } from './descriptions/Global.description';
import { resourceProperty } from './descriptions/shared';
import { 
	bookstackApiRequest, 
	bookstackApiRequestAllItems,
	buildQueryString,
	validateRequiredParameters,
	formatBookstackError 
} from '../../utils/BookstackApiHelpers';
import { IBookstackListResponse, IBookstackSearchResult } from '../../types/BookstackTypes';

export class Bookstack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bookstack',
		name: 'bookstack',
		icon: 'file:bookstack.svg',
		group: ['transform'],
		version: 1,
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: any;

				if (resource === 'global') {
					if (operation === 'search') {
						let query = this.getNodeParameter('query', i) as string;
						const typeFilter = this.getNodeParameter('typeFilter', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i, true) as boolean;
						const limit = this.getNodeParameter('limit', i, 100) as number;
						const page = this.getNodeParameter('page', i, 1) as number;
						validateRequiredParameters(this.getNode(), { query }, ['query']);
						if (typeFilter && typeFilter !== 'all') {
							query += ` {type:${typeFilter}}`;
						}
						const qs = buildQueryString({
							count: returnAll ? undefined : limit,
							offset: returnAll ? undefined : (page - 1) * limit,
						});
						qs.query = query;
						if (returnAll) {
							const allData = await bookstackApiRequestAllItems.call(this, 'GET', 'search', {}, qs);
							responseData = allData;
						} else {
							const searchResponse: IBookstackListResponse<IBookstackSearchResult> = 
								await bookstackApiRequest.call(this, 'GET', 'search', {}, qs);
							responseData = searchResponse.data || searchResponse;
						}
					}
				}

				// CRUD for book, page, shelf, chapter
				if (['book', 'page', 'shelf', 'chapter'].includes(resource)) {
					let endpoint = '';
					let method = 'GET';
					let body: any = {};
					let qs: any = {};

					if (operation === 'getAll') {
						endpoint = `/${resource}s`;
						responseData = await bookstackApiRequestAllItems.call(this, 'GET', endpoint, {}, {});
					} else if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						endpoint = `/${resource}s/${id}`;
						responseData = await bookstackApiRequest.call(this, 'GET', endpoint, {}, {});
					} else if (operation === 'create') {
						endpoint = `/${resource}s`;
						// Collect fields for create
						body = {};
						const createFields = ['name', 'description', 'tags', 'book_id', 'chapter_id', 'html', 'markdown'];
						for (const field of createFields) {
							const value = this.getNodeParameter(field, i, undefined);
							if (value !== undefined && value !== '') {
								body[field] = value;
							}
						}
						// Convert tags to array if present
						if (body.tags && typeof body.tags === 'string') {
							body.tags = body.tags.split(',').map((t: string) => ({ name: t.trim() }));
						}
						responseData = await bookstackApiRequest.call(this, 'POST', endpoint, body, {});
					} else if (operation === 'update') {
						const id = this.getNodeParameter('id', i) as string;
						endpoint = `/${resource}s/${id}`;
						body = {};
						const updateFields = ['name', 'description', 'tags', 'book_id', 'chapter_id', 'html', 'markdown'];
						for (const field of updateFields) {
							const value = this.getNodeParameter(field, i, undefined);
							if (value !== undefined && value !== '') {
								body[field] = value;
							}
						}
						if (body.tags && typeof body.tags === 'string') {
							body.tags = body.tags.split(',').map((t: string) => ({ name: t.trim() }));
						}
						responseData = await bookstackApiRequest.call(this, 'PUT', endpoint, body, {});
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('id', i) as string;
						endpoint = `/${resource}s/${id}`;
						responseData = await bookstackApiRequest.call(this, 'DELETE', endpoint, {}, {});
					}
				}

				// Handle response data
				if (Array.isArray(responseData)) {
					// Multiple items
					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else {
					// Single item
					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				const errorMessage = formatBookstackError(error);
				throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
