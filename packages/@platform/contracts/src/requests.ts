export interface ApiRequest<B = unknown, Q = unknown, P = unknown> {
  body: B;
  query: Q;
  params: P;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery {
  search?: string;
  fields?: string[]; // Fields to search in
}

export interface BaseQuery extends PaginationQuery, SortQuery, SearchQuery {
  [key: string]: any;
}
