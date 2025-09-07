import { ILoadOptionsFunctions, IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	NodeApiError,
	JsonObject,
	NodeOperationError,
} from 'n8n-workflow';
import { IBookstackListResponse, IBookstackApiRequestOptions } from '../types/BookstackTypes';

/**
 * Handle and format BookStack API errors
 */
function handleBookstackError(node: any, error: unknown): NodeApiError {
	if (error instanceof NodeApiError) {
		// If it's already a NodeApiError, just re-throw it
		return error;
	}

	let errorDetails: JsonObject = {};

	if (error instanceof Error) {
		// Standard Error object
		const errorResponse = (error as any).response?.body || (error as any).response || {};
		errorDetails = {
			name: error.name,
			message: formatBookstackError(error),
			stack: error.stack ?? null,
			response: errorResponse,
		};
	} else if (typeof error === 'object' && error !== null) {
		// Other object types
		errorDetails = {
			message: formatBookstackError(error),
			...error,
		};
	} else {
		// Primitives or other types
		errorDetails = {
			message: 'An unknown error occurred',
			error: String(error),
		};
	}

	return new NodeApiError(node, errorDetails);
}

/**
 * Make an API request to BookStack
 */
export async function bookstackApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('bookstackApi');
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials found for BookStack API');
	}

	const baseUrl = credentials.baseUrl as string;
	
	// Remove leading slash from endpoint if present
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
	
	const options: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: `${baseUrl}/${cleanEndpoint}`,
		headers: {
			'Authorization': `Token ${credentials.tokenId}:${credentials.tokenSecret}`,
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		json: true,
	};

	try {
		return await this.helpers.httpRequest(options);
	} catch (error) {
		throw handleBookstackError(this.getNode(), error);
	}
}

/**
 * Make an API request for binary content (exports)
 */
export async function bookstackApiRequestBinary(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject = {},
	accept: string = '*/*',
): Promise<Buffer> {
	const credentials = await this.getCredentials('bookstackApi');
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials found for BookStack API');
	}

	const baseUrl = credentials.baseUrl as string;
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

	const options: IHttpRequestOptions = {
		method,
		qs,
		url: `${baseUrl}/${cleanEndpoint}`,
		headers: {
			'Authorization': `Token ${credentials.tokenId}:${credentials.tokenSecret}`,
			'Accept': accept,
		},
		json: false,
		encoding: 'arraybuffer',
	};

	try {
		const data = (await this.helpers.httpRequest(options)) as unknown as Buffer;
		return Buffer.isBuffer(data) ? data : Buffer.from(data as any);
	} catch (error) {
		throw handleBookstackError(this.getNode(), error);
	}
}

/**
 * Make an API request to get all items (handles pagination)
 */
export async function bookstackApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	maxCount = 500,
): Promise<any[]> {
	let returnData: any[] = [];
	let offset = 0;
	const count = Math.min(maxCount, 500); // BookStack max is 500 per request

	do {
		const currentQs = { ...qs };
		currentQs.count = count;
		currentQs.offset = offset;

		const responseData: IBookstackListResponse<any> = await bookstackApiRequest.call(
			this,
			method,
			endpoint,
			body,
			currentQs,
		);

		if (responseData.data && Array.isArray(responseData.data)) {
			returnData.push(...responseData.data);

			// Stop if this response has fewer items than requested (last page)
			if (responseData.data.length < count) {
				break;
			}

			// Stop if we've reached the total (if available)
			if (responseData.total && returnData.length >= responseData.total) {
				break;
			}

			offset += responseData.data.length;
		} else if (responseData.data) {
			// Single item response wrapped in data property
			return [responseData.data];
		} else {
			// No data property, assume it's a single item or empty result
			return responseData ? [responseData] : [];
		}

		// Safety break to avoid infinite loops
		if (offset > maxCount * 100) {
			console.warn('BookStack pagination: Stopped after excessive pagination to prevent infinite loop');
			break;
		}

	} while (returnData.length < maxCount);

	return returnData.slice(0, maxCount);
}

/**
 * Handle BookStack API query parameters and filters
 */
export function buildQueryString(options: IBookstackApiRequestOptions): IDataObject {
	const qs: IDataObject = {};

	if (options.count !== undefined) {
		qs.count = Math.min(options.count, 500); // BookStack max
	}

	if (options.offset !== undefined) {
		qs.offset = options.offset;
	}

	if (options.sort) {
		qs.sort = options.sort;
	}

	if (options.filter) {
		for (const [key, value] of Object.entries(options.filter)) {
			qs[`filter[${key}]`] = value;
		}
	}

	return qs;
}

/**
 * Validate required parameters
 */
export function validateRequiredParameters(
	node: any,
	parameters: { [key: string]: any },
	required: string[],
): void {
	for (const param of required) {
		if (parameters[param] === undefined || parameters[param] === '') {
			throw new NodeOperationError(node, `Missing required parameter: ${param}`);
		}
	}
}

/**
 * Format BookStack errors for better user experience
 */
export function formatBookstackError(error: any): string {
	if (error.response?.body?.error?.message) {
		return error.response.body.error.message;
	}
	
	if (error.response?.body?.message) {
		return error.response.body.message;
	}

	if (error.response?.status === 400) {
		return 'Bad request. Please check your query parameters and try again.';
	}

	if (error.response?.status === 401) {
		return 'Authentication failed. Please check your API credentials.';
	}
	
	if (error.response?.status === 403) {
		return 'Access denied. Please check your user permissions in BookStack.';
	}
	
	if (error.response?.status === 404) {
		return 'Resource not found. Please check the ID or URL.';
	}
	
	if (error.response?.status === 422) {
		return 'Invalid data provided. Please check your input parameters.';
	}

	if (error.response?.status === 429) {
		return 'Rate limit exceeded. Please wait before making more requests.';
	}

	if (error.response?.status >= 500) {
		return 'BookStack server error. Please try again later or contact your administrator.';
	}

	return error.message || 'Your request is invalid or could not be processed by the service';
}
