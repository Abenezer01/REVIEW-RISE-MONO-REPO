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

    async findByLocationId(locationId: string, params?: { skip?: number; take?: number; category?: string }): Promise<[LocationPhoto[], number]> {
        const where: Prisma.LocationPhotoWhereInput = { locationId };
        if (params?.category) {
            where.category = params.category;
        }

        const [photos, total] = await Promise.all([
            this.delegate.findMany({
                where,
                skip: params?.skip || 0,
                take: params?.take || 100,
                orderBy: { createTime: 'desc' },
            }),
            this.delegate.count({ where }),
        ]);

        return [photos, total];
    }

    async upsertPhotos(photos: Prisma.LocationPhotoCreateInput[]): Promise<void> {
        // Prisma doesn't support bulk upsert out of the box easily, so we can do it in a transaction
        // Since sqlite/pg upsert behavior differs, we use transaction with individual upserts
        await prisma.$transaction(
            photos.map((photo) =>
                prisma.locationPhoto.upsert({
                    where: { id: photo.id as string },
                    create: photo,
                    update: photo,
                })
            )
        );
    }

    async getStats(locationId: string) {
        const total = await this.delegate.count({ where: { locationId } });
        const coverCount = await this.delegate.count({ where: { locationId, category: 'COVER' } });
        const interiorCount = await this.delegate.count({ where: { locationId, category: 'INTERIOR' } });

        return {
            total,
            coverCount,
            interiorCount
        };
    }
}

export const locationPhotoRepository = new LocationPhotoRepository();
