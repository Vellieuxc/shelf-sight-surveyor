
export interface Comment {
  id: string;
  picture_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string;
}
