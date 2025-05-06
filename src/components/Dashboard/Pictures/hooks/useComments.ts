
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { Comment } from "../types";

export function useComments(pictureId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);
  const hasLoadedInitial = useRef(false);
  const currentPictureId = useRef(pictureId);
  
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
    if (!forceRefresh && hasLoadedInitial.current && pictureId === currentPictureId.current) {
      return;
    }

    try {
      setIsLoading(true);
      
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
    } catch (error) {
      if (isMounted.current) {
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
      }
    }
  }, [pictureId, handleError]);
  
  // Fetch comments when pictureId changes
  useEffect(() => {
    // Reset state when pictureId changes
    if (pictureId !== currentPictureId.current) {
      setIsLoading(true);
      hasLoadedInitial.current = false;
    }
    
    fetchComments(false);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [pictureId, fetchComments]);

  // Reset the isMounted ref when the component remounts
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Add a comment to the local state
  const addComment = useCallback((newComment: Comment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  }, []);

  // Force refresh the comments
  const refreshComments = useCallback(() => fetchComments(true), [fetchComments]);

  return {
    comments,
    isLoading,
    addComment,
    refreshComments
  };
}
