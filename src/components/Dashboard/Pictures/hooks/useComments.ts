
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { Comment } from "../types";

export function useComments(pictureId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const hasLoadedInitial = useRef(false);
  const currentPictureId = useRef(pictureId);
  const channelRef = useRef<any>(null);
  const isRefreshing = useRef(false);
  
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'useComments',
    operation: 'fetchComments'
  });

  // Fetch comments with user profiles
  const fetchComments = useCallback(async (forceRefresh = false) => {
    // Skip if no pictureId
    if (!pictureId) {
      return;
    }
    
    // Skip loading if we've already loaded and this isn't a forced refresh
    if (!forceRefresh && hasLoadedInitial.current && pictureId === currentPictureId.current && !isRefreshing.current) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      isRefreshing.current = true;
      
      console.log(`Fetching comments for picture ${pictureId}, force refresh: ${forceRefresh}`);
      
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('picture_comments')
        .select('*')
        .eq('picture_id', pictureId)
        .order('created_at', { ascending: false });
      
      if (commentsError) throw commentsError;
      
      // If component unmounted during the fetch, don't update state
      if (!isMounted.current) return;
      
      // If we have no comments, set empty array and return early
      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        hasLoadedInitial.current = true;
        currentPictureId.current = pictureId;
        setIsLoading(false);
        isRefreshing.current = false;
        return;
      }
      
      // Create a map of unique user IDs for batch fetching
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      // Batch fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      
      if (profilesError) {
        console.warn("Error fetching user profiles:", profilesError);
      }
      
      // If component unmounted during the fetch, don't update state
      if (!isMounted.current) return;
      
      // Create a lookup map of profiles by userId
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }
      
      // Map comments with user names
      const commentsWithUser: Comment[] = commentsData.map(comment => {
        let userName = "Unknown User";
        
        const profile = profilesMap.get(comment.user_id);
        if (profile) {
          userName = profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile.email || "Unknown User";
        }
        
        return {
          ...comment,
          user_name: userName
        };
      });
      
      setComments(commentsWithUser);
      console.log("Comments fetched successfully:", commentsWithUser.length);
    } catch (error) {
      if (isMounted.current) {
        console.error("Error fetching comments:", error);
        const errorObj = error as Error;
        setError(errorObj);
        handleError(error, {
          operation: 'fetchComments',
          fallbackMessage: "Failed to load comments",
          showToast: true
        });
        // Set empty comments array to prevent eternal loading state
        setComments([]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        hasLoadedInitial.current = true;
        currentPictureId.current = pictureId;
        isRefreshing.current = false;
      }
    }
  }, [pictureId, handleError]);
  
  // Fetch comments when pictureId changes
  useEffect(() => {
    isMounted.current = true;
    
    // Reset state when pictureId changes
    if (pictureId !== currentPictureId.current) {
      setIsLoading(true);
      setError(null);
      hasLoadedInitial.current = false;
    }
    
    fetchComments(false);
    
    // Set up real-time subscription for comments
    const channelName = `picture_comments_${pictureId}`;
    console.log(`Setting up subscription for ${channelName}`);
    
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
          console.log("Real-time update received for comments:", payload);
          if (!isMounted.current) return;
          
          // Refetch comments to ensure we have the latest data with user information
          fetchComments(true);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for comments on picture ${pictureId}:`, status);
      });
    
    // Store the channel reference for proper cleanup
    channelRef.current = channel;
    
    // Cleanup function
    return () => {
      console.log(`Cleaning up subscription for ${channelName}`);
      isMounted.current = false;
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [pictureId, fetchComments]);

  // Force refresh the comments
  const refreshComments = useCallback(() => {
    console.log("Force refreshing comments for picture:", pictureId);
    return fetchComments(true);
  }, [fetchComments, pictureId]);

  return {
    comments,
    isLoading,
    error,
    refreshComments
  };
}
