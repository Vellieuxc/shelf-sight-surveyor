
export enum UserRole {
  CREW = 'crew',
  CONSULTANT = 'consultant',
  BOSS = 'boss'
}

export type User = {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isBlocked?: boolean;
}

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  country: string;
  created_by: string;
  created_at: string;
  is_closed: boolean;
}

export type Store = {
  id: string;
  project_id: string;
  type: string;
  name: string;
  address: string;
  country: string;
  google_map_pin?: string;
  store_image?: string;
  created_at: string;
  created_by: string;
}

export type AnalysisData = {
  sku_name: string;
  brand: string;
  sku_count: number;
  sku_price: number;
  sku_price_pre_promotion?: number;
  sku_price_post_promotion?: number;
  sku_position?: string; // Top, Middle, or Bottom
  empty_space_estimate?: number; // For empty shelves estimation (percentage)
  sku_confidence?: string; // high, mid, or low confidence level
  total_sku_facings?: number; // Summary field
  quality_picture?: string; // Summary field for image quality assessment
}

export type Picture = {
  id: string;
  store_id: string;
  uploaded_by: string;
  image_url: string;
  created_at: string;
  analysis_data: AnalysisData[];
}
