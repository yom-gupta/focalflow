export interface Project {
  id: string;
  title: string;
  type: 'thumbnail' | 'video' | 'other';
  client_name: string;
  price: number;
  quantity: number;
  link?: string;
  source_link?: string;
  notes?: string;
  status: 'not_started' | 'working' | 'delay' | 'complete' | 'cancel';
  thumbnail_url?: string;
  video_steps?: {
    cuts: boolean;
    color_grade: boolean;
    sound_design: boolean;
    motion_graphics: boolean;
    export: boolean;
  };
  thumbnail_steps?: {
    concept: boolean;
    design: boolean;
    review: boolean;
    final: boolean;
  };
  start_date?: string;
  deadline?: string;
  delay_days?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  youtube_url?: string;
  instagram_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'gear' | 'software' | 'marketing' | 'travel' | 'other';
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface UserProfile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface InspirationFolder {
  id: string;
  name: string;
  thumbnail_url?: string;
  item_count: number;
  pinned: boolean;
  attached_project_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface InspirationItem {
  id: string;
  folder_id: string;
  type: 'image' | 'link' | 'text' | 'screenshot';
  title?: string;
  url?: string;
  image_url?: string;
  note?: string;
  tags?: string[];
  user_id: string;
  created_at: string;
}

