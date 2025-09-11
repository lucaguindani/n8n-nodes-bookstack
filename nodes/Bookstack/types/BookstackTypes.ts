export interface IBookstackListResponse<T> {
	data: T[];
	total: number;
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
