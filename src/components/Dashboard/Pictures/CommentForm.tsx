
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { Comment } from "./types";

interface CommentFormProps {
  pictureId: string;
  onCommentAdded: (newComment: Comment) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ pictureId, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'CommentForm',
    operation: 'addComment'
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !user) {
      if (!user) {
        toast.error("You need to be logged in to comment");
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a temporary comment object for optimistic UI update
      const tempComment: Comment = {
        id: crypto.randomUUID(), // Temporary ID that will be replaced on refresh
        picture_id: pictureId,
        user_id: user.id,
        content: comment.trim(),
        created_at: new Date().toISOString(),
        user_name: profile?.firstName && profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}` 
          : user.email || "You"
      };
      
      // Update UI immediately (optimistic update)
      onCommentAdded(tempComment);
      
      // Clear the comment field immediately for better UX
      setComment("");
      
      // Add the comment to database
      const { error } = await supabase
        .from('picture_comments')
        .insert({
          picture_id: pictureId,
          user_id: user.id,
          content: tempComment.content
        });
      
      if (error) throw error;
      
      // Success toast
      toast.success("Comment added");
    } catch (error) {
      handleError(error, {
        operation: 'addComment',
        fallbackMessage: "Failed to add comment",
        showToast: true
      });
      // If desired, could revert the optimistic update here
    } finally {
      setIsSubmitting(false);
    }
  }, [comment, user, profile, pictureId, onCommentAdded, handleError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder={user ? "Add a comment..." : "Please log in to comment"}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px] resize-none"
        disabled={!user || isSubmitting}
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!user || !comment.trim() || isSubmitting}
          size="sm"
        >
          {isSubmitting ? "Saving..." : "Add Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
