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

type ApiCallerContext =
	| IHookFunctions
	| IExecuteFunctions
	| IExecuteSingleFunctions
	| ILoadOptionsFunctions;

/**
 * Make an API request to BookStack
 */
export async function bookstackApiRequest(
	this: ApiCallerContext,
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

export async function bookstackApiRequestMultipart(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	formFields: Record<string, string>,
	binaryPropertyName?: string,
	itemIndex = 0,
) {
	const credentials = await this.getCredentials('bookstackApi');

	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials found for BookStack API');
	}

	const baseUrl = credentials.baseUrl as string;

	// Remove leading slash from endpoint if present
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

	const boundary = `----n8nBookstackBoundary${Date.now()}`;
	const CRLF = '\r\n';
	const parts: Buffer[] = [];

	// Add text fields
	for (const [key, value] of Object.entries(formFields)) {
		if (value !== undefined && value !== '') {
			const part =
				`--${boundary}${CRLF}` +
				`Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}` +
				`${value}${CRLF}`;
			parts.push(Buffer.from(part, 'utf8'));
		}
	}

	// Add binary file if provided
	if (binaryPropertyName) {
		const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		const fileBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
		const fileName = binaryData.fileName ?? 'image';
		const mimeType = binaryData.mimeType ?? 'application/octet-stream';

		const fileHeader =
			`--${boundary}${CRLF}` +
			`Content-Disposition: form-data; name="image"; filename="${fileName}"${CRLF}` +
			`Content-Type: ${mimeType}${CRLF}${CRLF}`;
		parts.push(Buffer.from(fileHeader, 'utf8'));
		parts.push(fileBuffer);
		parts.push(Buffer.from(CRLF, 'utf8'));
	}

	// Closing boundary
	parts.push(Buffer.from(`--${boundary}--${CRLF}`, 'utf8'));

	const bodyBuffer = Buffer.concat(parts);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/${cleanEndpoint}`,
		headers: {
			'Content-Type': `multipart/form-data; boundary=${boundary}`,
		},
		body: bodyBuffer,
	};

	return await this.helpers.httpRequestWithAuthentication.call(this, 'bookstackApi', options);
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
