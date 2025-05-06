
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch comment count for a picture
 */
export function useCommentCount(pictureId: string) {
  const [count, setCount] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCommentCount = async () => {
      if (!pictureId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { count, error } = await supabase
          .from('picture_comments')
          .select('*', { count: 'exact', head: true })
          .eq('picture_id', pictureId);
        
        if (error) throw error;
        if (!isMounted) return;
        
        setCount(count || 0);
        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching comment count:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };
    
    fetchCommentCount();
    
    // Setup realtime subscription for comment count updates
    const channel = supabase
      .channel(`picture_comments_count_${pictureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'picture_comments',
          filter: `picture_id=eq.${pictureId}`
        },
        (payload) => {
          console.log("Comment count update received:", payload);
          fetchCommentCount();
        }
      )
      .subscribe((status) => {
        console.log(`Comment count subscription status for picture ${pictureId}:`, status);
      });
    
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [pictureId]);

  return { count, isLoading, error };
}
