export interface LocationDto {
    id: string;
    businessId: string;
    name: string;
    address: string | null;
    timezone: string | null;
    tags: string[];
    platformIds: Record<string, any> | null;
    status: string; // 'active' | 'archived' | 'deleted'
    createdAt: Date;
    updatedAt: Date;
    lastSync: Date | null;
    business?: {
        name: string;
    };
}

export interface CreateLocationRequest {
    name: string;
    businessId: string;
    address?: string;
    timezone?: string;
    tags?: string[];
    platformIds?: Record<string, any>;
    status?: string;
}

export interface UpdateLocationRequest {
    name?: string;
    businessId?: string;
    address?: string;
    timezone?: string;
    tags?: string[];
    platformIds?: Record<string, any>;
    status?: string;
}
