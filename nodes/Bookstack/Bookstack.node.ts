import { IExecuteFunctions } from 'n8n-workflow';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
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
	validateRequiredParameters,
	formatBookstackError,
} from '../utils/BookstackApiHelpers';
import { IBookstackListResponse, IBookstackSearchResult } from '../types/BookstackTypes';

export class Bookstack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BookStack',
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
						const limit = this.getNodeParameter('limit', i, 100) as number;
						const page = this.getNodeParameter('page', i, 1) as number;

						validateRequiredParameters(this.getNode(), { query }, ['query']);

						// Add type filter to query if specified
						if (typeFilter && typeFilter !== 'all') {
							query += ` {type:${typeFilter}}`;
						}

						// Build query parameters for BookStack search API
						const qs: any = {
							query: query,
							count: Math.min(limit, 500), // BookStack API limit
							page: page,
						};

						try {
							const endpoint = '/search';

							const searchResponse: IBookstackListResponse<IBookstackSearchResult> =
								await bookstackApiRequest.call(this, 'GET', endpoint, {}, qs);
							responseData = searchResponse.data || searchResponse;
						} catch (error) {
							// Enhanced error logging for debugging
							console.error('BookStack Search Error:', {
								endpoint: '/search',
								query: query,
								qs: qs,
								error: error,
							});

							const errorMsg = formatBookstackError(error);
							throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, {
								itemIndex: i,
							});
						}
					} else if (operation === 'auditLogList') {
						const limit = this.getNodeParameter('auditLimit', i, 50) as number;
						const offset = this.getNodeParameter('auditOffset', i, 0) as number;

						const qs: any = { count: Math.min(limit, 500), offset };
						const endpoint = '/audit-log';
						const res = await bookstackApiRequest.call(this, 'GET', endpoint, {}, qs);
						responseData = res?.data ?? res;
					}
				}

				// CRUD for book, page, shelf, chapter
				if (['book', 'page', 'shelf', 'chapter'].includes(resource)) {
					let endpoint = '';
					let body: any = {};

					// Map resource names to correct API endpoints
					const resourceEndpoints: { [key: string]: string } = {
						book: 'books',
						page: 'pages',
						shelf: 'shelves',
						chapter: 'chapters',
					};

					if (operation === 'getAll') {
						endpoint = `/${resourceEndpoints[resource]}`;

						const count = this.getNodeParameter('count', i) as number;
						const offset = this.getNodeParameter('offset', i) as number;
						const sortField = this.getNodeParameter('sortField', i) as string;
						const sortDirection = this.getNodeParameter('sortDirection', i) as string;
						const filters = this.getNodeParameter('filters', i, {}) as {
							filter: Array<{ field: string; operation: string; value: string }>;
						};

						const qs: IDataObject = {
							count,
							offset,
						};

						if (sortField) {
							qs.sort = sortDirection === 'desc' ? `-${sortField}` : `+${sortField}`;
						}

						if (filters.filter) {
							// Ensure filters.filter is always an array (n8n may supply a single object when only one filter is set)
							const filterArray = Array.isArray(filters.filter) ? filters.filter : [filters.filter];

							filterArray.forEach((filter: any) => {
								if (!filter || !filter.field) return;
								// For 'eq' (equals) the API expects filter[field]=value (no :eq suffix). For other ops include :op
								const op = (filter.operation || 'eq').toString();
								const opPart = op && op !== 'eq' ? `:${op}` : '';
								qs[`filter[${filter.field}${opPart}]`] = filter.value;
							});
						}

						// If offset is provided, we don't need to paginate, just get that page.
						if (offset !== undefined && offset > 0) {
							const response = await bookstackApiRequest.call(this, 'GET', endpoint, {}, qs);
							responseData = response.data;
						} else {
							responseData = await bookstackApiRequestAllItems.call(
								this,
								'GET',
								endpoint,
								{},
								qs,
								count,
							);
						}
					} else if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						endpoint = `/${resourceEndpoints[resource]}/${id}`;
						responseData = await bookstackApiRequest.call(this, 'GET', endpoint, {}, {});
					} else if (operation === 'create') {
						endpoint = `/${resourceEndpoints[resource]}`;
						// Collect fields for create based on resource type
						body = {};

						if (resource === 'book') {
							const bookFields = [
								'name',
								'description',
								'description_html',
								'tags',
								'default_template_id',
							];
							for (const field of bookFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}
						} else if (resource === 'page') {
							const pageFields = ['name', 'html', 'markdown', 'book_id', 'chapter_id', 'tags'];
							for (const field of pageFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}

							// Validate that at least book_id or chapter_id is provided for page creation
							if (!body.book_id && !body.chapter_id) {
								throw new NodeOperationError(
									this.getNode(),
									'Either book_id or chapter_id must be provided when creating a page',
									{ itemIndex: i },
								);
							}

							// Validate that at least html or markdown content is provided for page creation
							if (!body.html && !body.markdown) {
								throw new NodeOperationError(
									this.getNode(),
									'Either html or markdown content must be provided when creating a page',
									{ itemIndex: i },
								);
							}
						} else if (resource === 'chapter') {
							const chapterFields = ['name', 'description', 'book_id', 'tags'];
							for (const field of chapterFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}
						} else if (resource === 'shelf') {
							const shelfFields = ['name', 'description', 'books', 'tags'];
							for (const field of shelfFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}
						}

						// Convert tags to array if present
						if (body.tags && typeof body.tags === 'string') {
							body.tags = body.tags.split(',').map((t: string) => ({ name: t.trim() }));
						}

						// Convert books to array of integers if present
						if (body.books && typeof body.books === 'string') {
							body.books = body.books
								.split(',')
								.map((id: string) => parseInt(id.trim(), 10))
								.filter((id: number) => !isNaN(id));
						}
						responseData = await bookstackApiRequest.call(this, 'POST', endpoint, body, {});
					} else if (operation === 'update') {
						const id = this.getNodeParameter('id', i) as string;
						endpoint = `/${resourceEndpoints[resource]}/${id}`;
						body = {};

						if (resource === 'book') {
							const bookFields = [
								'name',
								'description',
								'description_html',
								'tags',
								'default_template_id',
							];
							for (const field of bookFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}
						} else if (resource === 'page') {
							const pageFields = ['name', 'html', 'markdown', 'book_id', 'chapter_id', 'tags'];
							for (const field of pageFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}
						} else if (resource === 'chapter') {
							const chapterFields = ['name', 'description', 'book_id', 'tags'];
							for (const field of chapterFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}
						} else if (resource === 'shelf') {
							const shelfFields = ['name', 'description', 'books', 'tags'];
							for (const field of shelfFields) {
								const value = this.getNodeParameter(field, i, undefined);
								if (value !== undefined && value !== '') {
									body[field] = value;
								}
							}
						}

						// Convert tags to array if present
						if (body.tags && typeof body.tags === 'string') {
							body.tags = body.tags.split(',').map((t: string) => ({ name: t.trim() }));
						}

						// Convert books to array of integers if present
						if (body.books && typeof body.books === 'string') {
							body.books = body.books
								.split(',')
								.map((id: string) => parseInt(id.trim(), 10))
								.filter((id: number) => !isNaN(id));
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
				} else if (responseData !== undefined) {
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
