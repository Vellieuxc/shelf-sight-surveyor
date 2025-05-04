
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { Comment } from "../types";

export function useComments(pictureId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'useComments',
    operation: 'fetchComments'
  });

  // Memoize the fetch comments function to avoid recreating it on every render
  const fetchComments = useCallback(async () => {
    // Only proceed if we have a valid pictureId
    if (!pictureId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching comments for picture:", pictureId);
      
      // Fetch comments with a simple query first
      const { data: commentsData, error: commentsError } = await supabase
        .from('picture_comments')
        .select('*')
        .eq('picture_id', pictureId)
        .order('created_at', { ascending: false });
      
      if (commentsError) {
        throw commentsError;
      }
      
      console.log("Comments data received:", commentsData);
      
      // If we have no comments, set empty array and return early
      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }
      
      // Create a map of unique user IDs for batch fetching
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      // Batch fetch user profiles for all comments
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      
      if (profilesError) {
        console.warn("Error fetching user profiles:", profilesError);
        // Continue with default user names
      }
      
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
      console.error("Error fetching comments:", error);
      handleError(error, {
        operation: 'fetchComments',
        fallbackMessage: "Failed to load comments",
        additionalData: { pictureId },
        showToast: true
      });
      // Set empty comments array to prevent eternal loading state
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [pictureId, handleError]);
  
  // Fetch comments once when component mounts or pictureId changes
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback((newComment: Comment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  }, []);

  return {
    comments,
    isLoading,
    addComment,
    refreshComments: fetchComments
  };
}
