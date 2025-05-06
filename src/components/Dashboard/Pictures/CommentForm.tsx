
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { validateAndSanitizeComment } from "@/utils/validation/commentValidation";

interface CommentFormProps {
  pictureId: string;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ pictureId, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add a comment",
        variant: "destructive",
      });
      return;
    }
    
    // Validate and sanitize comment before submission
    const { isValid, sanitizedContent, errors } = validateAndSanitizeComment(comment);
    
    if (!isValid) {
      toast({
        title: "Invalid Comment",
        description: errors[0] || "Please check your comment and try again",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting comment for picture:", pictureId);
      
      // Insert comment using sanitized content for improved security
      const { error, data } = await supabase
        .from("picture_comments")
        .insert({
          picture_id: pictureId,
          user_id: user.id,
          content: sanitizedContent
        })
        .select();
        
      if (error) throw error;
      
      console.log("Comment added successfully:", data);
      setComment("");
      
      // Explicitly call onCommentAdded to refresh the comments list
      onCommentAdded();
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully",
      });
      
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Comment Failed",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Ensure we set isSubmitting back to false to prevent the interface from remaining frozen
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!comment.trim() || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
