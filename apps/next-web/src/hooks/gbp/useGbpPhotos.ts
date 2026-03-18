/* eslint-disable import/no-unresolved */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/configs/services';
import type { GetGbpPhotosQuery } from '@platform/contracts';

export const useGbpPhotos = (locationId: string, query: GetGbpPhotosQuery = { skip: 0, take: 100 }) => {
    return useQuery({
        queryKey: ['gbp-photos', locationId, query],
        queryFn: async () => {
            if (!locationId) return null;

            const res = await apiClient.get(`${SERVICES.gbp.url}/locations/${locationId}/photos`, {
                params: query,
                headers: { 'x-skip-system-message': '1' }
            });


            return res.data;
        },
        enabled: !!locationId,
        staleTime: 10 * 60 * 1000, // 10 minutes cache
    });
};

export const useSyncGbpPhotos = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (locationId: string) => {
            const res = await apiClient.post(
                `${SERVICES.gbp.url}/locations/${locationId}/photos/sync`,
                undefined,
                { headers: { 'x-skip-system-message': '1' } }
            );


            return res.data;
        },
        onSuccess: (_, locationId) => {
            queryClient.invalidateQueries({ queryKey: ['gbp-photos', locationId] });
        }
    });
};

export const useUploadGbpPhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ locationId, file, category }: { locationId: string; file: File; category: string }) => {
            const formData = new FormData();

            formData.append('photo', file);
            formData.append('category', category);

            const res = await apiClient.post(
                `${SERVICES.gbp.url}/locations/${locationId}/photos`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data', 'x-skip-system-message': '1' }
                }
            );

            
return res.data;
        },
        onSuccess: (_, { locationId }) => {
            queryClient.invalidateQueries({ queryKey: ['gbp-photos', locationId] });
        }
    });
};

export const useDeleteGbpPhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ locationId, photoId }: { locationId: string; photoId: string }) => {
            const encodedPhotoId = encodeURIComponent(photoId);

            const res = await apiClient.delete(
                `${SERVICES.gbp.url}/locations/${locationId}/photos/${encodedPhotoId}`,
                { headers: { 'x-skip-system-message': '1' } }
            );

            
return res.data;
        },
        onSuccess: (_, { locationId }) => {
            queryClient.invalidateQueries({ queryKey: ['gbp-photos', locationId] });
        }
    });
};

export const getGbpPhotoProxyUrl = (locationId: string, photoId: string) => {
    // The photoId is usually a Google full path like accounts/123/locations/456/media/789
    // To handle slashes we might need to encode it
    const encodedPhotoId = encodeURIComponent(photoId);


    return `${SERVICES.gbp.url}/locations/${locationId}/photos/proxy/${encodedPhotoId}`;
};
