import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import {
	bookstackApiRequest,
	validateRequiredParameters,
	formatBookstackError,
} from '../utils/BookstackApiHelpers';

export class BookstackTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BookStack Tool',
		name: 'bookstackTool',
		icon: 'file:bookstack.svg',
		group: ['transform'],
		version: 1,
		description:
			'Access and search BookStack knowledge base content. Use this tool to search across all content types (books, pages, chapters, shelves) in BookStack.',
		defaults: {
			name: 'BookStack Tool',
		},
		inputs: ['ai_tool'],
		outputs: ['ai_tool'],
		credentials: [
			{
				name: 'bookstackApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Global Search',
						value: 'globalSearch',
						description:
							'Search across all content types (books, pages, chapters, shelves) in BookStack',
						action: 'Perform global search',
					},
				],
				default: 'globalSearch',
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['globalSearch'],
					},
				},
				default: '',
				placeholder: 'e.g., installation guide, API documentation',
				description:
					'Keywords, phrases, or terms to search for in the content. Use the {{ $fromAI("searchQuery") }} expression to let the AI model auto-fill the field.',
			},
			{
				displayName: 'Content Type Filter',
				name: 'typeFilter',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['globalSearch'],
					},
				},
				options: [
					{ name: 'All Content', value: 'all' },
					{ name: 'Books Only', value: 'book' },
					{ name: 'Pages Only', value: 'page' },
					{ name: 'Chapters Only', value: 'chapter' },
					{ name: 'Shelves Only', value: 'bookshelf' },
				],
				default: 'all',
				description: 'Filter search results by specific content type',
			},
			{
				displayName: 'Result Limit',
				name: 'resultLimit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['globalSearch'],
					},
				},
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 500,
				},
				description: 'Maximum number of results to return (1-500)',
			},
			{
				displayName: 'Deep Dive',
				name: 'deepDive',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['globalSearch'],
					},
				},
				default: true,
				description:
					'Whether to automatically retrieve full content for all found pages, chapters, books and shelves. This provides more context but may increase execution time.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const searchQuery = this.getNodeParameter('searchQuery', i) as string;
				const typeFilter = this.getNodeParameter('typeFilter', i, 'all') as string;
				const resultLimit = this.getNodeParameter('resultLimit', i, 20) as number;
				const deepDive = this.getNodeParameter('deepDive', i, true) as boolean;

				validateRequiredParameters(this.getNode(), { searchQuery }, ['searchQuery']);

				let query = searchQuery;

				if (typeFilter && typeFilter !== 'all') {
					query += ` {type:${typeFilter}}`;
				}

				const endpoint = '/search';
				const qs = {
					query: query,
					count: Math.min(resultLimit, 500),
					page: 1,
				};

				const apiResponse = await bookstackApiRequest.call(this, 'GET', endpoint, {}, qs);

				// Structure results
				const results = apiResponse.data || apiResponse;
				let structuredResults = Array.isArray(results)
					? results.map((item: any) => ({
							id: item.id || null,
							name: item.name || null,
							type: item.type || null,
							url: item.url || null,
							preview: item.preview_html || null,
							tags: item.tags || null,
							book: item.book || null,
							chapter: item.chapter || null,
						}))
					: results;

				// Deep dive to fetch full content if enabled
				if (deepDive && Array.isArray(structuredResults)) {
					const enhancedResults = [];

					for (const item of structuredResults) {
						// Check if item has required fields for deep dive
						if (item.id && item.type) {
							try {
								const contentId = item.id;
								let contentEndpoint = '';

								// Determine the correct API endpoint based on type
								switch (item.type) {
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

								const contentResponse = await bookstackApiRequest.call(
									this,
									'GET',
									contentEndpoint,
									{},
									{},
								);

								// Common fields
								let fullContent: any = {
									created_at: contentResponse.created_at || null,
									updated_at: contentResponse.updated_at || null,
									created_by: contentResponse.created_by || null,
									updated_by: contentResponse.updated_by || null,
								};

								// Pages-specific fields
								if (item.type === 'page') {
									fullContent = {
										...fullContent,
										priority: contentResponse.priority || null,
										revision_count: contentResponse.revision_count || null,
										draft: contentResponse.draft || null,
										html: contentResponse.html || null,
										markdown: contentResponse.markdown || null,
									};
								}

								// Chapters-specific fields
								if (item.type === 'chapter') {
									fullContent = {
										...fullContent,
										priority: contentResponse.priority || null,
										description_html: contentResponse.description || null,
										pages: contentResponse.pages || null,
									};
								}

								// Books-specific fields
								if (item.type === 'book') {
									fullContent = {
										...fullContent,
										description_html: contentResponse.description || null,
										contents: contentResponse.contents || null,
										owned_by: contentResponse.owned_by || null,
										cover: contentResponse.cover || null,
									};
								}

								// Bookshelves-specific fields
								if (item.type === 'bookshelf') {
									fullContent = {
										...fullContent,
										description_html: contentResponse.description || null,
										books: contentResponse.books || null,
										cover: contentResponse.cover || null,
									};
								}

								enhancedResults.push({
									...item,
									fullContent,
								});
							} catch (contentError) {
								// If content fetch fails, include the item with error info
								enhancedResults.push({
									...item,
									fullContent: null,
									contentError: `Failed to fetch full content for ${item.id}`,
								});
							}
						} else {
							// If the item is missing a required field, add them as-is
							enhancedResults.push(item);
						}
					}

					structuredResults = enhancedResults;
				}

				const responseData = {
					operation: 'globalSearch',
					query: searchQuery,
					typeFilter,
					resultLimit,
					deepDiveEnabled: deepDive,
					totalFound: apiResponse.total || (Array.isArray(results) ? results.length : 0),
					summary: `Found ${Array.isArray(structuredResults) ? structuredResults.length : 0} results for "${searchQuery}"${typeFilter !== 'all' ? ` (${typeFilter} only)` : ''}${deepDive ? ' with full content retrieved' : ''}`,
					data: structuredResults,
				};

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error: any) {
				const errorMsg = formatBookstackError(error);
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: `BookStack API Error: ${errorMsg}`,
							operation: 'globalSearch',
						},
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, {
						itemIndex: i,
					});
				}
			}
		}

		return [returnData];
	}
}
