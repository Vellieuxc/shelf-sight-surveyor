
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch comment count for a picture
 */
export function useCommentCount(pictureId: string) {
  const [count, setCount] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);
  const isMounted = useRef(true);

  const fetchCommentCount = useCallback(async () => {
    if (!pictureId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { count, error } = await supabase
        .from('picture_comments')
        .select('*', { count: 'exact', head: true })
        .eq('picture_id', pictureId);
      
      if (error) throw error;
      if (!isMounted.current) return;
      
      setCount(count || 0);
      setIsLoading(false);
    } catch (err) {
      if (isMounted.current) {
        console.error("Error fetching comment count:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    }
  }, [pictureId]);
  
  useEffect(() => {
    isMounted.current = true;
    
    fetchCommentCount();
    
    // Setup realtime subscription for comment count updates
    const channelName = `picture_comments_count_${pictureId}`;
    console.log(`Setting up comment count subscription for ${channelName}`);
    
    const channel = supabase
      .channel(channelName)
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
          if (isMounted.current) {
            fetchCommentCount();
          }
        }
      )
      .subscribe((status) => {
        console.log(`Comment count subscription status for picture ${pictureId}:`, status);
      });
    
    // Store the channel reference to ensure proper cleanup
    channelRef.current = channel;
    
    return () => {
      console.log(`Cleaning up comment count subscription for ${channelName}`);
      isMounted.current = false;
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [pictureId, fetchCommentCount]);

  // Add a refresh function that can be called manually
  const refreshCount = useCallback(() => {
    console.log(`Manually refreshing comment count for picture ${pictureId}`);
    fetchCommentCount();
  }, [pictureId, fetchCommentCount]);

  return { count, isLoading, error, refreshCount };
}
