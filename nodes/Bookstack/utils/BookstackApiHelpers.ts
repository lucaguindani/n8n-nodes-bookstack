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

import { decodeErrorBody } from './exportHelpers';
import {
	BookstackVersion,
	PRE_SYSTEM_ENDPOINT_VERSION,
	getCompatibilityError,
	getRequiredVersion,
	parseBookstackVersion,
} from './versionCompatibility';

type ApiCallerContext =
	IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions;

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
	fileFieldName = 'image',
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
		const fileName = binaryData.fileName ?? fileFieldName;
		const mimeType = binaryData.mimeType ?? 'application/octet-stream';

		const fileHeader =
			`--${boundary}${CRLF}` +
			`Content-Disposition: form-data; name="${fileFieldName}"; filename="${fileName}"${CRLF}` +
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
 * Download a file from BookStack (e.g. an export), returning the raw bytes and response headers
 */
export async function bookstackApiRequestBinary(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<{ data: Buffer; headers: IDataObject }> {
	const credentials = await this.getCredentials('bookstackApi');

	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials found for BookStack API');
	}

	const baseUrl = credentials.baseUrl as string;
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${baseUrl}/${cleanEndpoint}`,
		json: false,
		encoding: 'arraybuffer',
		returnFullResponse: true,
	};

	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'bookstackApi',
			options,
		)) as { body: ArrayBuffer | Buffer; headers: IDataObject };

		const { body } = response;
		return { data: Buffer.isBuffer(body) ? body : Buffer.from(body), headers: response.headers };
	} catch (error) {
		const errorResponse = (error as { response?: { data?: unknown; body?: unknown } }).response;
		if (errorResponse) {
			errorResponse.data = decodeErrorBody(errorResponse.data);
			errorResponse.body = decodeErrorBody(errorResponse.body);
		}
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Detect the BookStack version through the system endpoint (available from v25.05).
 * Returns null when the instance reports a version string that cannot be parsed.
 */
export async function getBookstackVersion(
	this: ApiCallerContext,
): Promise<BookstackVersion | null> {
	try {
		const system = (await bookstackApiRequest.call(this, 'GET', '/system')) as IDataObject;
		return parseBookstackVersion(system.version);
	} catch (error) {
		if (String((error as NodeApiError).httpCode) === '404') {
			return PRE_SYSTEM_ENDPOINT_VERSION;
		}
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Fail early when the instance is too old for any of the requested operations
 */
export async function assertOperationsSupported(
	this: IExecuteFunctions,
	operations: Array<{ resource: string; operation: string; variant?: string }>,
): Promise<void> {
	const gated = operations.filter(({ resource, operation, variant }) =>
		getRequiredVersion(resource, operation, variant),
	);
	if (gated.length === 0) return;

	const detected = await getBookstackVersion.call(this);
	if (!detected) return;

	for (const { resource, operation, variant } of gated) {
		const message = getCompatibilityError(detected, resource, operation, variant);
		if (message) {
			throw new NodeOperationError(this.getNode(), message);
		}
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
