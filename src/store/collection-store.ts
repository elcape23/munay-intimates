import { create } from "zustand";
import { ShopifyProduct } from "@/lib/shopify";

export type CollectionPageInfo =
  | {
      hasNextPage: boolean;
      endCursor: string | null;
    }
  | undefined;

interface CollectionCache {
  items: ShopifyProduct[];
  pageInfo?: CollectionPageInfo;
  scrollY: number;
}

interface CollectionStore {
  collections: Record<string, CollectionCache>;
  save: (handle: string, data: CollectionCache) => void;
  clear: (handle: string) => void;
  get: (handle: string) => CollectionCache | undefined;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collections: {},
  save: (handle, data) =>
    set((state) => ({
      collections: { ...state.collections, [handle]: data },
    })),
  clear: (handle) =>
    set((state) => {
      const newCollections = { ...state.collections };
      delete newCollections[handle];
      return { collections: newCollections };
    }),
  get: (handle) => get().collections[handle],
}));
