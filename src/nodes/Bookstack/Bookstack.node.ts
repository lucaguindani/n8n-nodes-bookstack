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

						// Add type filter to query if specified
						if (typeFilter && typeFilter !== 'all') {
							query += ` {type:${typeFilter}}`;
						}

						// Build query parameters for BookStack search API
						const qs: any = {
							query: query
						};

						if (!returnAll) {
							qs.count = Math.min(limit, 500); // BookStack API limit
							qs.offset = (page - 1) * limit;
						}

						try {
							const endpoint = 'api/search';

							if (returnAll) {
								responseData = await bookstackApiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
							} else {
								const searchResponse: IBookstackListResponse<IBookstackSearchResult> =
									await bookstackApiRequest.call(this, 'GET', endpoint, {}, qs);
								responseData = searchResponse.data || searchResponse;
							}
						} catch (error) {
							// Enhanced error logging for debugging
							console.error('BookStack Search Error:', {
								endpoint: 'api/search',
								query: query,
								qs: qs,
								error: error
							});

							const errorMsg = formatBookstackError(error);
							throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, { itemIndex: i });
						}
					}
				}

				// CRUD for book, page, shelf, chapter
				if (['book', 'page', 'shelf', 'chapter'].includes(resource)) {
					let endpoint = '';
					let method = 'GET';
					let body: any = {};
					let qs: any = {};

					// Map resource names to correct API endpoints
					const resourceEndpoints: { [key: string]: string } = {
						'book': 'books',
						'page': 'pages',
						'shelf': 'shelves',
						'chapter': 'chapters'
					};

					if (operation === 'getAll') {
						endpoint = `/${resourceEndpoints[resource]}`;
						responseData = await bookstackApiRequestAllItems.call(this, 'GET', endpoint, {}, {});
					} else if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						endpoint = `/${resourceEndpoints[resource]}/${id}`;
						responseData = await bookstackApiRequest.call(this, 'GET', endpoint, {}, {});
					} else if (operation === 'create') {
						endpoint = `/${resourceEndpoints[resource]}`;
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
						endpoint = `/${resourceEndpoints[resource]}/${id}`;
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
						endpoint = `/${resourceEndpoints[resource]}/${id}`;
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
