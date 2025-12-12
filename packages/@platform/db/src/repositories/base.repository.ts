import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../client';

/**
 * Base Repository Class
 * 
 * Provides common CRUD operations and utilities for all repositories.
 * Extend this class to create model-specific repositories.
 * 
 * @template TModel - The Prisma model type
 * @template TDelegate - The Prisma delegate type for the model
 * @template TWhereInput - The where input type for filtering
 * @template TOrderByInput - The order by input type for sorting
 * @template TCreateInput - The create input type
 * @template TUpdateInput - The update input type
 */
export abstract class BaseRepository<
    TModel,
    TDelegate,
    TWhereInput,
    TOrderByInput,
    TCreateInput,
    TUpdateInput
> {
    protected readonly delegate: TDelegate;
    protected readonly modelName: string;

    constructor(delegate: TDelegate, modelName: string) {
        this.delegate = delegate;
        this.modelName = modelName;
    }

    /**
     * Find a single record by ID
     */
    async findById(id: string): Promise<TModel | null> {
        return (this.delegate as any).findUnique({
            where: { id },
        });
    }

    /**
     * Find multiple records with optional filtering, sorting, and pagination
     */
    async findMany(options?: {
        where?: TWhereInput;
        orderBy?: TOrderByInput | TOrderByInput[];
        take?: number;
        skip?: number;
    }): Promise<TModel[]> {
        return (this.delegate as any).findMany(options);
    }

    /**
     * Find first record matching criteria
     */
    async findFirst(options?: {
        where?: TWhereInput;
        orderBy?: TOrderByInput | TOrderByInput[];
    }): Promise<TModel | null> {
        return (this.delegate as any).findFirst(options);
    }

    /**
     * Create a new record
     */
    async create(data: TCreateInput): Promise<TModel> {
        return (this.delegate as any).create({
            data,
        });
    }

    /**
     * Update a record by ID
     */
    async update(id: string, data: TUpdateInput): Promise<TModel> {
        return (this.delegate as any).update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a record by ID (hard delete)
     */
    async delete(id: string): Promise<TModel> {
        return (this.delegate as any).delete({
            where: { id },
        });
    }

    /**
     * Soft delete a record by ID (sets deletedAt timestamp)
     * Only works for models with deletedAt field
     */
    async softDelete(id: string): Promise<TModel> {
        return (this.delegate as any).update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    /**
     * Restore a soft-deleted record
     */
    async restore(id: string): Promise<TModel> {
        return (this.delegate as any).update({
            where: { id },
            data: { deletedAt: null },
        });
    }

    /**
     * Count records matching criteria
     */
    async count(where?: TWhereInput): Promise<number> {
        return (this.delegate as any).count({
            where,
        });
    }

    /**
     * Check if a record exists
     */
    async exists(where: TWhereInput): Promise<boolean> {
        const count = await this.count(where);
        return count > 0;
    }

    /**
     * Find all records (use with caution on large tables)
     */
    async findAll(): Promise<TModel[]> {
        return (this.delegate as any).findMany();
    }

    /**
     * Find records excluding soft-deleted ones
     */
    async findManyActive(options?: {
        where?: TWhereInput;
        orderBy?: TOrderByInput | TOrderByInput[];
        take?: number;
        skip?: number;
    }): Promise<TModel[]> {
        return (this.delegate as any).findMany({
            ...options,
            where: {
                ...options?.where,
                deletedAt: null,
            },
        });
    }

    /**
     * Execute operations within a transaction
     */
    async transaction<T>(
        callback: (tx: Prisma.TransactionClient) => Promise<T>
    ): Promise<T> {
        return prisma.$transaction(callback);
    }

    /**
     * Upsert - create if doesn't exist, update if exists
     */
    async upsert(
        where: { id: string },
        create: TCreateInput,
        update: TUpdateInput
    ): Promise<TModel> {
        return (this.delegate as any).upsert({
            where,
            create,
            update,
        });
    }

    /**
     * Batch create multiple records
     */
    async createMany(data: TCreateInput[]): Promise<{ count: number }> {
        return (this.delegate as any).createMany({
            data,
            skipDuplicates: true,
        });
    }

    /**
     * Batch update multiple records
     */
    async updateMany(
        where: TWhereInput,
        data: Partial<TUpdateInput>
    ): Promise<{ count: number }> {
        return (this.delegate as any).updateMany({
            where,
            data,
        });
    }

    /**
     * Batch delete multiple records
     */
    async deleteMany(where: TWhereInput): Promise<{ count: number }> {
        return (this.delegate as any).deleteMany({
            where,
        });
    }
}
