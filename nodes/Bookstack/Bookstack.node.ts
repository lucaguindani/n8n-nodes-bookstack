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

type SearchItemMinimal = IDataObject;
type ContentResponseShape = IDataObject;

export class Bookstack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BookStack',
		name: 'bookstack',
		icon: 'file:../../icons/bookstack.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage BookStack resources',
		defaults: { name: 'Bookstack' },
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
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

	private buildBaseQueryParameters(context: IExecuteFunctions, itemIndex: number): IDataObject {
		const sortField = context.getNodeParameter('sortField', itemIndex, '') as string;
		const sortDirection = context.getNodeParameter('sortDirection', itemIndex, 'asc') as string;
		const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;

		const qs: IDataObject = {};

		if (sortField) {
			qs.sort = sortDirection === 'desc' ? `-${sortField}` : `+${sortField}`;
		}

		if (filters && (filters as IDataObject).filter) {
			const filterArray = Array.isArray((filters as IDataObject).filter)
				? ((filters as IDataObject).filter as IBookstackFilters[])
				: [(filters as IDataObject).filter as IBookstackFilters];
			filterArray.forEach((filter: IBookstackFilters) => {
				if (!filter?.field) return;
				const op = (filter.operation || 'eq').toString();
				const opPart = op !== 'eq' ? `:${op}` : '';
				(qs as IDataObject)[`filter[${filter.field}${opPart}]`] = filter.value;
			});
		}

		return qs;
	}

	private async handleSearchOperation(context: IExecuteFunctions, itemIndex: number) {
		let query = context.getNodeParameter('searchQuery', itemIndex) as string;
		const typeFilter = context.getNodeParameter('typeFilter', itemIndex) as string;
		const returnAll = context.getNodeParameter('returnAllSearch', itemIndex, false) as boolean;
		const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
		const deepDive = context.getNodeParameter('deepDive', itemIndex, false) as boolean;

		validateRequiredParameters(context.getNode(), { query }, ['query']);

		if (typeFilter && typeFilter !== 'all') {
			query += ` {type:${typeFilter}}`;
		}

		const aggregated: SearchItemMinimal[] = [];
		let page = 1;
		const perPageMax = 100;

		try {
			while (true) {
				const perPage = returnAll
					? perPageMax
					: Math.min(perPageMax, Math.max(1, limit - aggregated.length));
				const qs = { query, count: perPage, page } as IDataObject;

				const searchResponse = await bookstackApiRequest.call(context, 'GET', '/search', {}, qs);
				const dataArray = (searchResponse as IDataObject).data as unknown;
				let resultsArray: IDataObject[] = [];
				if (Array.isArray(dataArray)) {
					resultsArray = dataArray as IDataObject[];
				} else if (Array.isArray(searchResponse as unknown as unknown[])) {
					resultsArray = searchResponse as unknown as IDataObject[];
				}

				const pageResults: SearchItemMinimal[] = resultsArray.map((item) => {
					return {
						id: (item as IDataObject).id ?? null,
						name: (item as IDataObject).name ?? null,
						type: (item as IDataObject).type ?? null,
						url: (item as IDataObject).url ?? null,
						created_at: (item as IDataObject).created_at ?? null,
						updated_at: (item as IDataObject).updated_at ?? null,
						preview: (item as IDataObject).preview_html ?? null,
						tags: (item as IDataObject).tags ?? null,
						book: (item as IDataObject).book ?? null,
						chapter: (item as IDataObject).chapter ?? null,
						fullContent: null,
					} as SearchItemMinimal;
				});

				aggregated.push(...pageResults);

				const noMore = pageResults.length < perPage || (!returnAll && aggregated.length >= limit);
				if (noMore) break;
				page += 1;
			}

			let structuredResults: SearchItemMinimal[] = aggregated;

			if (deepDive && Array.isArray(structuredResults)) {
				const enhancedResults: IDataObject[] = [];

				for (const item of structuredResults) {
					if (item.id && item.type) {
						try {
							const contentId = item.id as string | number;
							let contentEndpoint = '';

							switch (item.type as string) {
								case 'page':
									contentEndpoint = `/pages/${contentId}`;
									break;
								case 'chapter':
									contentEndpoint = `/chapters/${contentId}`;
									break;
								case 'book':
									contentEndpoint = `/books/${contentId}`;
									break;
								case 'bookshelf':
									contentEndpoint = `/shelves/${contentId}`;
									break;
							}

							const contentResponse = (await bookstackApiRequest.call(
								context,
								'GET',
								contentEndpoint,
								{},
								{},
							)) as ContentResponseShape;

							const fullContent: IDataObject = {};
							const setIfPresent = (key: string, alias?: string) => {
								const v = (contentResponse as IDataObject)[key];
								fullContent[alias || key] = v !== undefined ? v : null;
							};

							setIfPresent('created_by');
							setIfPresent('updated_by');

							if (item.type === 'page') {
								setIfPresent('priority');
								setIfPresent('revision_count');
								setIfPresent('draft');
								setIfPresent('html');
								setIfPresent('markdown');
							}

							if (item.type === 'chapter') {
								setIfPresent('priority');
								setIfPresent('description', 'description_html');
								setIfPresent('pages');
							}

							if (item.type === 'book') {
								setIfPresent('description', 'description_html');
								setIfPresent('contents');
								setIfPresent('cover');
							}

							if (item.type === 'bookshelf') {
								setIfPresent('description', 'description_html');
								setIfPresent('books');
								setIfPresent('cover');
							}

							enhancedResults.push({ ...(item as IDataObject), fullContent } as IDataObject);
						} catch {
							enhancedResults.push({
								...(item as IDataObject),
								fullContent: null,
								contentError: 'Failed to fetch full content for this item',
							} as IDataObject);
						}
					} else {
						enhancedResults.push(item as IDataObject);
					}
				}

				structuredResults = enhancedResults as IDataObject[];
			}

			// Apply limit if not returning all
			if (!returnAll && Array.isArray(structuredResults) && structuredResults.length > limit) {
				structuredResults = structuredResults.slice(0, limit);
			}

			return structuredResults as IDataObject[];
		} catch (error) {
			const e = error as Error;
			throw new NodeOperationError(context.getNode(), e.message || 'Unknown error', { itemIndex });
		}
	}

	private async handleAuditLogOperation(context: IExecuteFunctions, itemIndex: number) {
		const returnAll = context.getNodeParameter('returnAllAudit', itemIndex, false) as boolean;
		const limit = context.getNodeParameter('auditLimit', itemIndex, 50) as number;

		const perRequestMax = 500;
		let offset = 0;
		const aggregated: JsonObject[] = [];

		while (true) {
			const count = returnAll
				? perRequestMax
				: Math.min(perRequestMax, Math.max(1, limit - aggregated.length));
			const qs = { count, offset } as IDataObject;
			const res = await bookstackApiRequest.call(
				context,
				'GET',
				'/audit-log?sort=-created_at',
				{},
				qs,
			);
			const data: JsonObject[] = (res?.data ?? res) as JsonObject[];

			aggregated.push(...data);

			const noMore = data.length < count || (!returnAll && aggregated.length >= limit);
			if (noMore) break;
			offset += count;
		}

		return returnAll ? aggregated : aggregated.slice(0, limit);
	}

	private async handleGetAllOperation(
		context: IExecuteFunctions,
		endpoint: string,
		itemIndex: number,
	) {
		const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = context.getNodeParameter('limit', itemIndex, 100) as number;

		const baseQs = this.buildBaseQueryParameters(context, itemIndex);
		const fullEndpoint = `/${endpoint}`;
		const perRequestMax = 500;
		let offset = 0;
		const aggregated: JsonObject[] = [];

		while (true) {
			const count = returnAll
				? perRequestMax
				: Math.min(perRequestMax, Math.max(1, limit - aggregated.length));
			const qs = { ...baseQs, count, offset } as IDataObject;
			const response = await bookstackApiRequest.call(context, 'GET', fullEndpoint, {}, qs);
			const data = (response as IDataObject).data ?? response;
			const pageItems: JsonObject[] = Array.isArray(data) ? (data as JsonObject[]) : [];
			aggregated.push(...pageItems);

			const noMore = pageItems.length < count || (!returnAll && aggregated.length >= limit);
			if (noMore) break;
			offset += count;
		}

		return returnAll ? aggregated : aggregated.slice(0, limit);
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

				let responseData: IDataObject[] | IDataObject | undefined;

				if (resource === 'global') {
					if (operation === 'search') {
						responseData = (await nodeInstance.handleSearchOperation(this, i)) as IDataObject[];
					} else if (operation === 'auditLogList') {
						responseData = (await nodeInstance.handleAuditLogOperation(this, i)) as IDataObject[];
					}
				} else if (['book', 'page', 'shelf', 'chapter'].includes(resource)) {
					const endpoint = nodeInstance.resourceEndpoints[resource];

					switch (operation) {
						case 'getAll':
							responseData = (await nodeInstance.handleGetAllOperation(
								this,
								endpoint,
								i,
							)) as IDataObject[];
							break;
						case 'get':
							responseData = (await nodeInstance.handleGetOperation(
								this,
								endpoint,
								i,
							)) as IDataObject;
							break;
						case 'create':
							responseData = (await nodeInstance.handleCreateOperation(
								this,
								resource,
								endpoint,
								i,
							)) as IDataObject;
							break;
						case 'update':
							responseData = (await nodeInstance.handleUpdateOperation(
								this,
								resource,
								endpoint,
								i,
							)) as IDataObject;
							break;
						case 'delete':
							responseData = (await nodeInstance.handleDeleteOperation(
								this,
								endpoint,
								i,
							)) as IDataObject;
							break;
					}
				}

				if (Array.isArray(responseData)) {
					responseData.forEach((item: IDataObject) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else if (responseData !== undefined) {
					returnData.push({
						json: responseData as IDataObject,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				const e = error as Error;
				throw new NodeOperationError(this.getNode(), e.message || 'Unknown error', {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
