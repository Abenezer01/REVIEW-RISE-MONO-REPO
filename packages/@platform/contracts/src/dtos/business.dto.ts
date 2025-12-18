/**
 * Business DTO
 */
export interface BusinessDto {
    id: string;
    name: string;
    slug: string;
    email?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}
