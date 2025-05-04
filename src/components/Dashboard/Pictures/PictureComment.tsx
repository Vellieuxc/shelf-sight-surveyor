
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { handleDatabaseError } from "@/utils/errors";

interface PictureCommentProps {
  pictureId: string;
}

interface Comment {
  id: string;
  picture_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

const PictureComment: React.FC<PictureCommentProps> = ({ pictureId }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { handleError, runSafely } = useErrorHandling({
    source: 'database',
    componentName: 'PictureComment',
    operation: 'manageComments'
  });

  // Fetch existing comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching comments for picture:", pictureId);
        
        // Fetch comments with user profiles in a single query using joins
        const { data, error } = await supabase
          .from('picture_comments')
          .select(`
            *,
            profiles:user_id (
              first_name, 
              last_name,
              email
            )
          `)
          .eq('picture_id', pictureId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log("Comments data received:", data);
        
        // Process the joined data
        const commentsWithUser: Comment[] = (data || []).map(comment => {
          let userName = "Unknown User";
          
          if (comment.profiles) {
            const profile = comment.profiles as UserProfile;
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
    };
    
    if (pictureId) {
      fetchComments();
    }
  }, [pictureId, handleError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Add the comment to database
      const { error } = await supabase
        .from('picture_comments')
        .insert({
          picture_id: pictureId,
          user_id: user.id,
          content: comment
        });
      
      if (error) throw error;
      
      // Create a new comment object to add to the UI immediately
      const newComment: Comment = {
        id: Math.random().toString(),  // Temporary ID
        picture_id: pictureId,
        user_id: user.id,
        content: comment,
        created_at: new Date().toISOString(),
        user_name: profile?.firstName && profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}` 
          : user.email || "You"
      };
      
      // Add the new comment to the comments array
      setComments([newComment, ...comments]);
      setComment("");
      toast.success("Comment added");
    } catch (error) {
      handleError(error, {
        operation: 'addComment',
        fallbackMessage: "Failed to add comment",
        showToast: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!comment.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? "Saving..." : "Add Comment"}
          </Button>
        </div>
      </form>
      
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-md p-3 bg-muted/40">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium">{comment.user_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PictureComment;
