import { Prisma, LocationPhoto } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class LocationPhotoRepository extends BaseRepository<
    LocationPhoto,
    typeof prisma.locationPhoto,
    Prisma.LocationPhotoWhereInput,
    Prisma.LocationPhotoOrderByWithRelationInput,
    Prisma.LocationPhotoCreateInput,
    Prisma.LocationPhotoUpdateInput
> {
    constructor() {
        super(prisma.locationPhoto, 'LocationPhoto');
    }

    private getDelegate() {
        return this.delegate as any;
    }

    async findByLocationId(locationId: string, params?: { skip?: number; take?: number; category?: string }): Promise<[LocationPhoto[], number]> {
        const delegate = this.getDelegate();
        if (!delegate?.findMany || !delegate?.count) {
            return [[], 0];
        }

        const where: Prisma.LocationPhotoWhereInput = { locationId };
        if (params?.category) {
            where.category = params.category;
        }

        const [photos, total] = await Promise.all([
            delegate.findMany({
                where,
                skip: params?.skip || 0,
                take: params?.take || 100,
                orderBy: { createTime: 'desc' },
            }),
            delegate.count({ where }),
        ]);

        return [photos, total];
    }

    async upsertPhotos(photos: Prisma.LocationPhotoCreateInput[]): Promise<void> {
        const locationPhotoDelegate = (prisma as any).locationPhoto;
        if (!locationPhotoDelegate?.upsert || photos.length === 0) {
            return;
        }

        // Prisma doesn't support bulk upsert out of the box easily, so we can do it in a transaction
        // Since sqlite/pg upsert behavior differs, we use transaction with individual upserts
        await prisma.$transaction(
            photos.map((photo) =>
                locationPhotoDelegate.upsert({
                    where: { id: photo.id as string },
                    create: photo,
                    update: photo,
                })
            )
        );
    }

    async getStats(locationId: string) {
        const delegate = this.getDelegate();
        if (!delegate?.count) {
            return {
                total: 0,
                coverCount: 0,
                interiorCount: 0
            };
        }

        const total = await delegate.count({ where: { locationId } });
        const coverCount = await delegate.count({ where: { locationId, category: 'COVER' } });
        const interiorCount = await delegate.count({ where: { locationId, category: 'INTERIOR' } });

        return {
            total,
            coverCount,
            interiorCount
        };
    }
}

export const locationPhotoRepository = new LocationPhotoRepository();
