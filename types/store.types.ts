export type StoreCategoryId = 'islamic' | 'modern' | 'career' | 'global';

export type StoreProductType = 'pdf' | 'video' | 'audio' | 'bundle';

export type StoreProduct = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  categoryId: StoreCategoryId;
  price: number;
  type: StoreProductType;
  coverImage: string;
  fileName: string;
  fileSize: string;
  preview?: string;
  highlights: string[];
  includes: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviews: number;
  relatedIds: string[];
};

export type StoreCategory = {
  id: StoreCategoryId;
  name: string;
  description: string;
  tagline: string;
};

export type StoreTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  productId: string;
};

export type StorePurchase = {
  id: string;
  productId: string;
  date: string;
  amount: number;
  status: 'paid' | 'refunded' | 'pending';
};

export type StoreDownload = {
  id: string;
  productId: string;
  date: string;
  status: 'available' | 'expired';
};
