
import React, { useState } from "react";
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
  const { handleError, runSafely } = useErrorHandling({
    source: 'database',
    componentName: 'CommentForm',
    operation: 'addComment'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !user) {
      if (!user) {
        toast.error("You need to be logged in to comment");
      }
      return;
    }
    
    setIsSubmitting(true);
    
    const { data, error } = await runSafely(async () => {
      // Add the comment to database
      const { error } = await supabase
        .from('picture_comments')
        .insert({
          picture_id: pictureId,
          user_id: user.id,
          content: comment.trim()
        });
      
      if (error) throw error;
      
      // Create a temporary comment object for UI
      const newComment: Comment = {
        id: crypto.randomUUID(), // Temporary ID that will be replaced on refresh
        picture_id: pictureId,
        user_id: user.id,
        content: comment.trim(),
        created_at: new Date().toISOString(),
        user_name: profile?.firstName && profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}` 
          : user.email || "You"
      };
      
      return newComment;
    }, {
      operation: 'addComment',
      fallbackMessage: "Failed to add comment",
      showToast: true
    });
    
    if (data && !error) {
      // Add the new comment to the comments array
      onCommentAdded(data);
      setComment("");
      toast.success("Comment added");
    }
    
    setIsSubmitting(false);
  };

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
