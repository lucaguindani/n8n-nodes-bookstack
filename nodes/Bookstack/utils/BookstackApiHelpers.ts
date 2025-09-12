import {
	IDataObject,
	IHookFunctions,
	IExecuteSingleFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IExecuteFunctions,
	JsonObject,
	NodeOperationError,
	INode,
	NodeApiError,
} from 'n8n-workflow';

/**
 * Make an API request to BookStack
 */
export async function bookstackApiRequest(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
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
			Authorization: `Token ${credentials.tokenId}:${credentials.tokenSecret}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
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
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	maxCount = 500,
) {
	const returnData = [];
	let offset = 0;
	const count = Math.min(maxCount, 500); // BookStack max is 500 per request

	do {
		const currentQs = { ...qs };
		currentQs.count = count;
		currentQs.offset = offset;

		const responseData = await bookstackApiRequest.call(this, method, endpoint, body, currentQs);

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
			break;
		}
	} while (returnData.length < maxCount);

	return returnData.slice(0, maxCount);
}

/**
 * Validate required parameters
 */
export function validateRequiredParameters(
	node: INode,
	parameters: JsonObject,
	required: string[],
): void {
	for (const param of required) {
		if (parameters[param] === undefined || parameters[param] === '') {
			throw new NodeOperationError(node, `Missing required parameter: ${param}`);
		}
	}
}
