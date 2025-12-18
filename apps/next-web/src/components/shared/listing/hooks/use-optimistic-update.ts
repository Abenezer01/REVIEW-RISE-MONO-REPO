import { useState, useCallback } from 'react';

import { useListing } from './use-listing';

/**
 * Hook for optimistic updates
 * Updates UI immediately, then syncs with server
 */
export const useOptimisticUpdate = <T extends { id: string | number }>() => {
    const { items, refresh } = useListing<T>();
    const [optimisticItems, setOptimisticItems] = useState<T[]>([]);

    /**
     * Perform an optimistic update
     * @param id - Item ID to update
     * @param updater - Function to update the item
     * @param apiCall - API call to sync with server
     */
    const update = useCallback(async (
        id: string | number,
        updater: (item: T) => T,
        apiCall: () => Promise<void>
    ) => {
        // Store current state for rollback
        const previousItems = [...items];

        // Optimistically update UI
        const updatedItems = items.map(item =>
            item.id === id ? updater(item) : item
        );

        setOptimisticItems(updatedItems);

        try {
            // Sync with server
            await apiCall();

            // Refresh from server to get authoritative state
            refresh();
        } catch (error) {
            // Rollback on error
            setOptimisticItems(previousItems);
            throw error;
        }
    }, [items, refresh]);

    /**
     * Perform an optimistic delete
     * @param id - Item ID to delete
     * @param apiCall - API call to delete on server
     */
    const remove = useCallback(async (
        id: string | number,
        apiCall: () => Promise<void>
    ) => {
        // Store current state for rollback
        const previousItems = [...items];

        // Optimistically remove from UI
        const updatedItems = items.filter(item => item.id !== id);

        setOptimisticItems(updatedItems);

        try {
            // Sync with server
            await apiCall();

            // Refresh from server
            refresh();
        } catch (error) {
            // Rollback on error
            setOptimisticItems(previousItems);
            throw error;
        }
    }, [items, refresh]);

    /**
     * Perform an optimistic create
     * @param newItem - New item to add
     * @param apiCall - API call to create on server
     */
    const create = useCallback(async (
        newItem: T,
        apiCall: () => Promise<T>
    ) => {
        // Optimistically add to UI
        setOptimisticItems([...items, newItem]);

        try {
            // Create on server
            const createdItem = await apiCall();


            // Refresh to get server state
            refresh();
            
return createdItem;
        } catch (error) {
            // Rollback on error
            setOptimisticItems(items);
            throw error;
        }
    }, [items, refresh]);

    return {
        items: optimisticItems.length > 0 ? optimisticItems : items,
        update,
        remove,
        create
    };
};
