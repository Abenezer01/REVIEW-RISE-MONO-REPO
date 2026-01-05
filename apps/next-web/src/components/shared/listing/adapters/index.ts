export { createBatchAdapter, createStatus, createAction, createAvatar } from './adapter-utils';
export { adaptLocationToListingItem, adaptLocationsToListingItems, createLocationAdapter } from './location-adapter';
export { createKeywordAdapter } from './keyword-adapter';

// Export types
export type { ListingItem, ListingItemAction, ListingItemStatus, ListingItemAdapter, ListingItemBatchAdapter } from '@/types/general/listing-item';
