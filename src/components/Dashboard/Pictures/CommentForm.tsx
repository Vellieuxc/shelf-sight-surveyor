
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useErrorHandling } from "@/hooks/use-error-handling";

interface CommentFormProps {
  pictureId: string;
  onCommentAdded: (newComment: any) => void;
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
      const newComment = {
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
      onCommentAdded(newComment);
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
  );
};

export default CommentForm;
