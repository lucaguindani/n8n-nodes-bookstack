import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class BookstackApi implements ICredentialType {
	name = 'bookstackApi';
	displayName = 'BookStack API';
	documentationUrl = 'https://demo.bookstackapp.com/api/docs';
	icon: Icon = { light: 'file:../../icons/bookstack.svg', dark: 'file:../../icons/bookstack.dark.svg' };
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://your-bookstack.com/api',
			placeholder: 'https://your-bookstack.com/api',
			description: 'The base URL of your BookStack instance (including /api)',
			required: true,
		},
		{
			displayName: 'Token ID',
			name: 'tokenId',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'e.g., C6mdvEQTGnebsmVn3sFNeeuelGEBjyQp',
			description: 'The Token ID from your BookStack API token',
			required: true,
		},
		{
			displayName: 'Token Secret',
			name: 'tokenSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'e.g., NOvD3VlzuSVuBPNaf1xWHmy7nIRlaj22',
			description: 'The Token Secret from your BookStack API token',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Token {{$credentials.tokenId}}:{{$credentials.tokenSecret}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/docs.json',
			method: 'GET',
		},
	};
}
