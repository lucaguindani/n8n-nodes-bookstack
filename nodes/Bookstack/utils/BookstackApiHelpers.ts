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
		json: true,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'bookstackApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
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
