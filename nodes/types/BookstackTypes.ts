// BookStack API Response Types
export interface IBookstackListResponse<T> {
	data: T[];
	total: number;
}

export interface IBookstackBook {
	id: number;
	name: string;
	slug: string;
	description: string;
	created_at: string;
	updated_at: string;
	created_by: number;
	updated_by: number;
	image_id?: number;
	tags?: IBookstackTag[];
}

export interface IBookstackPage {
	id: number;
	name: string;
	slug: string;
	html: string;
	markdown: string;
	text: string;
	created_at: string;
	updated_at: string;
	created_by: number;
	updated_by: number;
	book_id: number;
	chapter_id?: number;
	draft: boolean;
	revision_count: number;
	template: boolean;
	tags?: IBookstackTag[];
}

export interface IBookstackChapter {
	id: number;
	name: string;
	slug: string;
	description: string;
	created_at: string;
	updated_at: string;
	created_by: number;
	updated_by: number;
	book_id: number;
	priority: number;
	tags?: IBookstackTag[];
}

export interface IBookstackShelf {
	id: number;
	name: string;
	slug: string;
	description: string;
	created_at: string;
	updated_at: string;
	created_by: number;
	updated_by: number;
	image_id?: number;
	tags?: IBookstackTag[];
	books?: IBookstackBook[];
}

export interface IBookstackTag {
	name: string;
	value: string;
}

export interface IBookstackSearchResult {
	type: 'book' | 'page' | 'chapter' | 'shelf';
	id: number;
	name: string;
	slug: string;
	book_id?: number;
	chapter_id?: number;
	tags?: IBookstackTag[];
	preview_html?: {
		name: string;
		content: string;
	};
}

export interface IBookstackUser {
	id: number;
	name: string;
	email: string;
	created_at: string;
	updated_at: string;
	email_confirmed: boolean;
	image_id?: number;
	roles: IBookstackRole[];
}

export interface IBookstackRole {
	id: number;
	display_name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

// API Request Options
export interface IBookstackApiRequestOptions {
	count?: number;
	offset?: number;
	sort?: string;
	filter?: { [key: string]: string };
}
