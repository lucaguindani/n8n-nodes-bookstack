import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	JsonObject,
} from 'n8n-workflow';

import { bookstackApiRequest, validateRequiredParameters } from './utils/BookstackApiHelpers';

export class BookstackTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BookStack Tool',
		name: 'bookstackTool',
		icon: { light: 'file:../../icons/bookstack.svg', dark: 'file:../../icons/bookstack.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Access and search BookStack content. Use this tool to search across all content types (books, pages, chapters, shelves) and optionally audit logs.',
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
					{ name: 'Chapters Only', value: 'chapter' },
					{ name: 'Pages Only', value: 'page' },
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
			{
				displayName: 'Include Audit Logs',
				name: 'includeAuditLogs',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['globalSearch'],
					},
				},
				default: false,
				description:
					'Whether to retrieve the latest audit log entries along with search results. Permission to both "Manage System Settings" and "Manage Users" are needed for this.',
			},
			{
				displayName: 'Audit Log Limit',
				name: 'auditLimit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['globalSearch'],
						includeAuditLogs: [true],
					},
				},
				default: 100,
				typeOptions: {
					minValue: 1,
					maxValue: 500,
				},
				description: 'Maximum number of audit log entries to return (1-500)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: JsonObject;

				if (operation === 'globalSearch') {
					const searchQuery = this.getNodeParameter('searchQuery', i) as string;
					const typeFilter = this.getNodeParameter('typeFilter', i, 'all') as string;
					const resultLimit = this.getNodeParameter('resultLimit', i, 20) as number;
					const deepDive = this.getNodeParameter('deepDive', i, true) as boolean;
					const includeAuditLogs = this.getNodeParameter('includeAuditLogs', i, false) as boolean;
					const auditLimit = this.getNodeParameter('auditLimit', i, 50) as number;

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
						? results.map((item: JsonObject) => ({
								id: item.id || null,
								name: item.name || null,
								type: item.type || null,
								url: item.url || null,
								created_at: item.created_at || null,
								updated_at: item.updated_at || null,
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
									let fullContent: JsonObject = {
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
								} catch {
									// If content fetch fails, include the item with error info
									enhancedResults.push({
										...item,
										fullContent: null,
										contentError: `Failed to fetch full content for this item`,
									});
								}
							} else {
								// If the item is missing a required field, add them as-is
								enhancedResults.push(item);
							}
						}

						structuredResults = enhancedResults;
					}

					// Fetch audit logs if requested
					let auditLogData = null;
					if (includeAuditLogs) {
						try {
							const auditQs: JsonObject = {
								count: Math.min(auditLimit, 500),
							};

							const auditResponse = await bookstackApiRequest.call(
								this,
								'GET',
								'/audit-log?sort=-created_at',
								{},
								auditQs,
							);

							// Structure audit log results
							const auditResults = auditResponse.data || auditResponse;
							const structuredAuditResults = Array.isArray(auditResults)
								? auditResults.map((item: JsonObject) => ({
										id: item.id || null,
										type: item.type || null,
										detail: item.detail || null,
										user_id: item.user_id || null,
										loggable_id: item.loggable_id || null,
										loggable_type: item.loggable_type || null,
										ip: item.ip || null,
										created_at: item.created_at || null,
										user: item.user || null,
									}))
								: auditResults;

							auditLogData = {
								auditLimit,
								totalFound:
									auditResponse.total || (Array.isArray(auditResults) ? auditResults.length : 0),
								entries: structuredAuditResults,
							};
						} catch {
							auditLogData = {
								error: 'Failed to fetch audit log data',
								auditLimit,
							};
						}
					}

					responseData = {
						operation: 'globalSearch',
						query: searchQuery,
						typeFilter,
						resultLimit,
						deepDiveEnabled: deepDive,
						auditLogsEnabled: includeAuditLogs,
						auditLogs: auditLogData,
						searchData: structuredResults,
						totalFound: apiResponse.total || (Array.isArray(results) ? results.length : 0),
						summary: `Found ${Array.isArray(structuredResults) ? structuredResults.length : 0} results for "${searchQuery}"${typeFilter !== 'all' ? ` (${typeFilter} only)` : ''}${deepDive ? ' with full content retrieved' : ''}${includeAuditLogs ? ' and audit logs included' : ''}`,
					};
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
						itemIndex: i,
					});
				}

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const operation = this.getNodeParameter('operation', i, 'globalSearch') as string;
					returnData.push({
						json: {
							error: `BookStack API Error`,
							operation,
						},
						pairedItem: {
							item: i,
						},
					});
				} else {
					throw new NodeOperationError(this.getNode(), error.message || error, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}
