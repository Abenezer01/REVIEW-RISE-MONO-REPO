import { PaginationQuery } from '../requests';

export interface GbpPhotoDto {
    id: string;
    locationId: string;
    accountId: string | null;
    googleUrl: string;
    thumbnailUrl: string;
    category: string | null;
    createTime: string | null; // Dates serialized as strings
    updateTime: string | null;
    sourceUrl: string | null;
    attribution: string | null;
    mediaFormat: string;
    lastSyncedAt: string;
}

export interface GetGbpPhotosQuery extends PaginationQuery {
    category?: string;
    skip?: number;
    take?: number;
}

export interface GbpPhotoStatsDto {
    total: number;
    coverCount: number;
    interiorCount: number;
}
