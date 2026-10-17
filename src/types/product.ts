export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  code_category: string;
  created_at: string | null;
  updated_at: string | null;
};

export type Product = {
  type: string;
  id: number;
  category_id: number;
  trainer_id: number;
  type_id: number;
  rating: number;
  time_start: string;
  time_end: string;
  slug: string;
  name: string;
  status: string;
  cover: string;
  hours: number;
  price: string;
  discount: number;
  promo_price: string;
  category: ProductCategory;
};

export type ProductListData = {
  results: Product[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ProductApiResponse = {
  errorCode: number;
  message: string;
  error: unknown | null;
  statusCode: number;
  data: ProductListData;
};
