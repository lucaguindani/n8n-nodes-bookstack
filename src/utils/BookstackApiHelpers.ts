import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-core';
import {
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { IBookstackListResponse, IBookstackApiRequestOptions } from '../types/BookstackTypes';

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
		throw new NodeApiError(this.getNode(), error);
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

	qs.count = count;

	do {
		qs.offset = offset;
		const responseData: IBookstackListResponse<any> = await bookstackApiRequest.call(
			this,
			method,
			endpoint,
			body,
			qs,
		);

		if (responseData.data) {
			returnData.push(...responseData.data);
			offset += responseData.data.length;

			// Stop if we've reached the total or if this response has fewer items than requested
			if (returnData.length >= responseData.total || responseData.data.length < count) {
				break;
			}
		} else {
			// If no data property, assume it's a single item or error
			return [responseData];
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
	
	if (error.response?.status === 401) {
		return 'Authentication failed. Please check your API credentials.';
	}
	
	if (error.response?.status === 403) {
		return 'Access denied. Please check your user permissions in BookStack.';
	}
	
	if (error.response?.status === 404) {
		return 'Resource not found. Please check the ID or URL.';
	}
	
	if (error.response?.status === 429) {
		return 'Rate limit exceeded. Please wait before making more requests.';
	}

	return error.message || 'An unknown error occurred';
}
