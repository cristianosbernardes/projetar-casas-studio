import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL = 'https://qzadvicbpbhirthkadfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YWR2aWNicGJoaXJ0aGthZGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODgwNzAsImV4cCI6MjA4MzM2NDA3MH0.K_wi9TSD_GTe1uQ5-UR0N8hsPFv2nwrg8pnDTEGv5mU';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to transform image URLs to WebP with quality optimization
export const getOptimizedImageUrl = (url: string, options?: { width?: number; quality?: number }) => {
  if (!url) return '';
  
  // If it's a Supabase storage URL, add transformation parameters
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    params.set('format', 'webp');
    params.set('quality', String(options?.quality || 80));
    if (options?.width) {
      params.set('width', String(options.width));
    }
    return `${url}?${params.toString()}`;
  }
  
  return url;
};
