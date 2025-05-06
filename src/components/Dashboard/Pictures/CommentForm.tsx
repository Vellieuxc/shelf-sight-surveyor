
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { validateAndSanitizeComment } from "@/utils/validation/commentValidation";
import { toast } from "sonner";
import { useErrorHandling } from "@/hooks/use-error-handling";

interface CommentFormProps {
  pictureId: string;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ pictureId, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { user } = useAuth();
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'CommentForm',
    operation: 'addComment'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    
    if (!user || !pictureId) return;

    // Validate and sanitize the comment content
    const { isValid, sanitizedContent, errors } = validateAndSanitizeComment(content);
    
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the sanitized comment into the database
      const { error } = await supabase.from("picture_comments").insert({
        picture_id: pictureId,
        user_id: user.id,
        content: sanitizedContent
      });

      if (error) throw error;
      
      // Clear form and notify success
      setContent("");
      toast.success("Comment added successfully");
      onCommentAdded();
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to add comment",
        operation: 'addComment',
        additionalData: { pictureId },
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
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px] resize-none"
        disabled={isSubmitting}
      />
      
      {validationErrors.length > 0 && (
        <div className="text-sm text-destructive">
          {validationErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="sm" 
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Submitting..." : "Add Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
