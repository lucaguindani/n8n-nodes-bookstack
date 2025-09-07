import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

import {
  bookstackApiRequest,
  bookstackApiRequestAllItems,
  validateRequiredParameters,
  formatBookstackError
} from '../../utils/BookstackApiHelpers';

export class BookstackTool implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BookStack Tool',
    name: 'bookstackTool',
    icon: 'file:bookstack.svg',
    group: ['transform'],
    version: 1,
    description: 'Access and search BookStack knowledge base content. Use this tool to retrieve books, pages, search content, and access documentation.',
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
            name: 'Get Book Details',
            value: 'getBook',
            description: 'Retrieve complete information about a specific book including its structure and metadata',
            action: 'Get book details by ID',
          },
          {
            name: 'Search Books',
            value: 'searchBooks',
            description: 'Search specifically within books using keywords, titles, or content',
            action: 'Search for books',
          },
          {
            name: 'Get Page Content',
            value: 'getPage',
            description: 'Retrieve the full content and metadata of a specific page',
            action: 'Get page content by ID',
          },
          {
            name: 'List All Books',
            value: 'listBooks',
            description: 'Get a complete list of all available books in the BookStack instance',
            action: 'List all books',
          },
          {
            name: 'Global Search',
            value: 'globalSearch',
            description: 'Search across all content types (books, pages, chapters, shelves) in BookStack',
            action: 'Perform global search',
          },
        ],
        default: 'globalSearch',
      },
      // Dynamic parameters that can be filled by AI
      {
        displayName: 'Book ID',
        name: 'bookId',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['getBook'],
          },
        },
        default: '',
        placeholder: 'e.g., 123',
        description: 'The numeric ID of the book to retrieve. You can find this in the BookStack URL or from search results.',
      },
      {
        displayName: 'Page ID',
        name: 'pageId',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['getPage'],
          },
        },
        default: '',
        placeholder: 'e.g., 456',
        description: 'The numeric ID of the page to retrieve. You can find this in the BookStack URL or from search results.',
      },
      {
        displayName: 'Search Query',
        name: 'searchQuery',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['searchBooks', 'globalSearch'],
          },
        },
        default: '',
        placeholder: 'e.g., installation guide, API documentation',
        description: 'Keywords, phrases, or terms to search for in the content',
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
            operation: ['searchBooks', 'globalSearch'],
          },
        },
        default: 20,
        typeOptions: {
          minValue: 1,
          maxValue: 500,
        },
        description: 'Maximum number of results to return (1-500)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        switch (operation) {
          case 'getBook':
            {
              const bookId = this.getNodeParameter('bookId', i) as string;
              validateRequiredParameters(this.getNode(), { bookId }, ['bookId']);

              try {
                const endpoint = `/books/${bookId}`;
                const apiResponse = await bookstackApiRequest.call(this, 'GET', endpoint, {}, {});
                responseData = {
                  operation: 'getBook',
                  bookId,
                  summary: `Book "${apiResponse.name}" (ID: ${bookId})`,
                  data: apiResponse
                };
              } catch (error) {
                const errorMsg = formatBookstackError(error);
                throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, { itemIndex: i });
              }
            }
            break;

          case 'searchBooks':
            {
              const searchQuery = this.getNodeParameter('searchQuery', i) as string;
              const resultLimit = this.getNodeParameter('resultLimit', i, 20) as number;
              validateRequiredParameters(this.getNode(), { searchQuery }, ['searchQuery']);

              try {
                const query = `${searchQuery} {type:book}`;
                const endpoint = '/search';
                const qs = {
                  query: query,
                  count: Math.min(resultLimit, 500),
                  page: 1
                };

                const apiResponse = await bookstackApiRequest.call(this, 'GET', endpoint, {}, qs);
                responseData = {
                  operation: 'searchBooks',
                  query: searchQuery,
                  resultLimit,
                  totalFound: apiResponse.total || (apiResponse.data ? apiResponse.data.length : 0),
                  summary: `Found ${apiResponse.data ? apiResponse.data.length : 0} books matching "${searchQuery}"`,
                  data: apiResponse.data || apiResponse
                };
              } catch (error) {
                const errorMsg = formatBookstackError(error);
                throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, { itemIndex: i });
              }
            }
            break;

          case 'getPage':
            {
              const pageId = this.getNodeParameter('pageId', i) as string;
              validateRequiredParameters(this.getNode(), { pageId }, ['pageId']);

              try {
                const endpoint = `/pages/${pageId}`;
                const apiResponse = await bookstackApiRequest.call(this, 'GET', endpoint, {}, {});

                // Extract useful information for AI
                const pageData = {
                  id: apiResponse.id,
                  name: apiResponse.name,
                  slug: apiResponse.slug,
                  book_id: apiResponse.book_id,
                  chapter_id: apiResponse.chapter_id,
                  draft: apiResponse.draft,
                  html: apiResponse.html,
                  markdown: apiResponse.markdown,
                  plain: apiResponse.plain, // Plain text version is useful for AI
                  created_at: apiResponse.created_at,
                  updated_at: apiResponse.updated_at,
                  url: apiResponse.url,
                  tags: apiResponse.tags
                };

                responseData = {
                  operation: 'getPage',
                  pageId,
                  summary: `Page "${apiResponse.name}" from book ID ${apiResponse.book_id}`,
                  data: pageData
                };
              } catch (error) {
                const errorMsg = formatBookstackError(error);
                throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, { itemIndex: i });
              }
            }
            break;

          case 'listBooks':
            {
              try {
                const endpoint = '/books';
                const apiResponse = await bookstackApiRequestAllItems.call(this, 'GET', endpoint, {}, {});

                // Provide structured summary for AI
                const booksSummary = apiResponse.map((book: any) => ({
                  id: book.id,
                  name: book.name,
                  slug: book.slug,
                  description: book.description,
                  created_at: book.created_at,
                  updated_at: book.updated_at,
                  url: book.url
                }));

                responseData = {
                  operation: 'listBooks',
                  count: apiResponse.length,
                  summary: `Found ${apiResponse.length} books in BookStack`,
                  data: booksSummary
                };
              } catch (error) {
                const errorMsg = formatBookstackError(error);
                throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, { itemIndex: i });
              }
            }
            break;

          case 'globalSearch':
            {
              const searchQuery = this.getNodeParameter('searchQuery', i) as string;
              const typeFilter = this.getNodeParameter('typeFilter', i, 'all') as string;
              const resultLimit = this.getNodeParameter('resultLimit', i, 20) as number;
              validateRequiredParameters(this.getNode(), { searchQuery }, ['searchQuery']);

              try {
                let query = searchQuery;

                if (typeFilter && typeFilter !== 'all') {
                  query += ` {type:${typeFilter}}`;
                }

                const endpoint = '/search';
                const qs = {
                  query: query,
                  count: Math.min(resultLimit, 500),
                  page: 1
                };

                const apiResponse = await bookstackApiRequest.call(this, 'GET', endpoint, {}, qs);

                // Structure results for better AI understanding
                const results = apiResponse.data || apiResponse;
                const structuredResults = Array.isArray(results) ? results.map((item: any) => ({
                  type: item.type,
                  id: item.id,
                  name: item.name || item.title,
                  preview: item.preview_content || item.preview || '',
                  url: item.url,
                  book_id: item.book_id,
                  chapter_id: item.chapter_id,
                  tags: item.tags || []
                })) : results;

                responseData = {
                  operation: 'globalSearch',
                  query: searchQuery,
                  typeFilter,
                  resultLimit,
                  totalFound: apiResponse.total || (Array.isArray(results) ? results.length : 0),
                  summary: `Found ${Array.isArray(structuredResults) ? structuredResults.length : 0} results for "${searchQuery}"${typeFilter !== 'all' ? ` (${typeFilter} only)` : ''}`,
                  data: structuredResults
                };
              } catch (error) {
                const errorMsg = formatBookstackError(error);
                throw new NodeOperationError(this.getNode(), `BookStack API Error: ${errorMsg}`, { itemIndex: i });
              }
            }
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Operation "${operation}" not supported`);
        }

        returnData.push({
          json: responseData,
          pairedItem: { item: i },
        });
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
            pairedItem: { item: i },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}
