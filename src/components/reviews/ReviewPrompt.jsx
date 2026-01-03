
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TipPrompt from '../tips/TipPrompt';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; // New import for animations

export default function ReviewPrompt({ booking, cleanerName, open, onClose, onSubmit }) { // Changed onReviewSubmitted to onSubmit
  const [hasReview, setHasReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [onTime, setOnTime] = useState(true);
  const [photoQuality, setPhotoQuality] = useState(true);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [productQuality, setProductQuality] = useState(5);
  const [productMatchedExpectation, setProductMatchedExpectation] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTipPrompt, setShowTipPrompt] = useState(false);
  const [error, setError] = useState(null); // New state for error messages

  // Effect to check for existing review and reset form state when the dialog opens
  useEffect(() => {
    if (open) {
      // Reset form state to default whenever the dialog is opened
      setRating(0);
      setComment('');
      setOnTime(true);
      setPhotoQuality(true);
      setWouldRecommend(true);
      setProductQuality(5);
      setProductMatchedExpectation(true);
      setSubmitting(false);
      setShowTipPrompt(false); // Ensure TipPrompt is hidden initially
      setHasReview(false); // Assume no review until checked
      setError(null); // Clear any previous errors
      checkExistingReview();
    }
  }, [open, booking.id]); // Dependencies: 'open' prop and 'booking.id'

  const checkExistingReview = async () => {
    try {
      const reviews = await base44.entities.Review.filter({
        booking_id: booking.id,
        client_email: booking.client_email
      });
      if (reviews.length > 0) {
        setHasReview(true);
        // If a review already exists for this booking, close the prompt and notify user.
        // This component is designed for submitting new reviews, not viewing existing ones.
        onClose(); 
        toast.info('You have already submitted a review for this booking.');
      } else {
        setHasReview(false);
      }
    } catch (error) {
      console.error('Error checking review:', error);
      toast.error('Failed to check for existing review.');
    }
  };

  const handleSubmit = async () => { // Renamed from handleSubmitReview
    if (rating === 0) {
      toast.error('Please select a star rating'); // Changed from alert to toast
      setError('Please select a rating'); // Set internal error state
      return;
    }

    setSubmitting(true);
    setError(null); // Clear previous errors

    try {
      await base44.entities.Review.create({
        booking_id: booking.id,
        client_email: booking.client_email,
        cleaner_email: booking.cleaner_email,
        rating,
        comment: comment.trim(),
        on_time: onTime,
        photo_quality: photoQuality,
        would_recommend: wouldRecommend,
        product_quality: productQuality,
        product_matched_expectation: productMatchedExpectation
      });

      // Update cleaner's average rating (kept from original logic)
      const allReviews = await base44.entities.Review.filter({ cleaner_email: booking.cleaner_email });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      const profiles = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email });
      if (profiles.length > 0) {
        await base44.entities.CleanerProfile.update(profiles[0].id, {
          average_rating: avgRating,
          total_reviews: allReviews.length
        });
      }

      await base44.entities.Booking.update(booking.id, { // New: Update booking status
        review_submitted: true
      });

      // After review submission, show the tip prompt
      toast.success('Review submitted successfully!'); // Moved success toast here, as per original flow
      setShowTipPrompt(true); // Open the tip prompt after successful review submission
      
      // Note: onClose() is now handled by TipPrompt's onTipSubmitted/onSkip callbacks
      // Note: onSubmit() (formerly onReviewSubmitted) is also handled by TipPrompt's callbacks
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.'); // Changed from alert to toast
      setError('Failed to submit review. Please try again.'); // Set internal error state
      setSubmitting(false); // Ensure submitting state is reset on error
    }
  };

  return (
    <AnimatePresence>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rate Your Experience with {cleanerName || 'your Cleaner'}</DialogTitle>
          </DialogHeader>
          
          {hasReview ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-semibold">Review Already Submitted</p>
              <p className="text-sm text-gray-500 mt-2">You have already shared your feedback for this booking.</p>
              <Button onClick={onClose} className="mt-4">Close</Button>
            </div>
          ) : (
            // Conditional rendering for review form or tip prompt
            !showTipPrompt ? (
              <motion.div
                key="review-form"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Star Rating */}
                <div className="text-center">
                  <Label className="text-lg mb-3 block">Overall Rating *</Label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-slate-600 mt-2">
                      {rating === 5 && 'Excellent!'}
                      {rating === 4 && 'Great!'}
                      {rating === 3 && 'Good'}
                      {rating === 2 && 'Fair'}
                      {rating === 1 && 'Poor'}
                    </p>
                  )}
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Display internal error */}
                </div>

                {/* Comment */}
                <div>
                  <Label>Your Review (optional)</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share details about your experience..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {/* Quick Questions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Arrived on time?</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={onTime ? "default" : "outline"}
                        onClick={() => setOnTime(true)}
                        className={onTime ? "bg-green-500" : ""}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!onTime ? "default" : "outline"}
                        onClick={() => setOnTime(false)}
                        className={!onTime ? "bg-red-500" : ""}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Good photo quality?</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={photoQuality ? "default" : "outline"}
                        onClick={() => setPhotoQuality(true)}
                        className={photoQuality ? "bg-green-500" : ""}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!photoQuality ? "default" : "outline"}
                        onClick={() => setPhotoQuality(false)}
                        className={!photoQuality ? "bg-red-500" : ""}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Would recommend?</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={wouldRecommend ? "default" : "outline"}
                        onClick={() => setWouldRecommend(true)}
                        className={wouldRecommend ? "bg-green-500" : ""}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!wouldRecommend ? "default" : "outline"}
                        onClick={() => setWouldRecommend(false)}
                        className={!wouldRecommend ? "bg-red-500" : ""}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  {/* New: Product Quality */}
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <Label className="text-sm font-medium mb-2 block text-center">Product Quality (1-5 stars)</Label>
                    <div className="flex justify-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setProductQuality(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= productQuality
                                ? 'fill-blue-400 text-blue-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-slate-600">Rate the quality of products used</p>
                  </div>

                  {/* New: Products matched description */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Products matched description?</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={productMatchedExpectation ? "default" : "outline"}
                        onClick={() => setProductMatchedExpectation(true)}
                        className={productMatchedExpectation ? "bg-green-500" : ""}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!productMatchedExpectation ? "default" : "outline"}
                        onClick={() => setProductMatchedExpectation(false)}
                        className={!productMatchedExpectation ? "bg-red-500" : ""}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tip-prompt"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <TipPrompt
                  booking={booking}
                  cleanerName={cleanerName} // Pass cleanerName to TipPrompt
                  open={true} // TipPrompt is considered open when showTipPrompt is true
                  onClose={onClose} // TipPrompt should manage its own close, which also closes ReviewPrompt
                  onTipSubmitted={(tipAmount) => {
                    setSubmitting(false); // Reset submitting state
                    toast.success(`Successfully tipped $${tipAmount}!`); // Moved success toast here
                    if (onSubmit) onSubmit({ rating, tipAmount }); // Call the new onSubmit prop
                    onClose(); // Close the main ReviewPrompt dialog
                  }}
                  onSkip={() => {
                    setSubmitting(false); // Reset submitting state
                    toast.info('Tip skipped.'); // Moved skip toast here
                    if (onSubmit) onSubmit({ rating, tipAmount: 0 }); // Call the new onSubmit prop
                    onClose(); // Close the main ReviewPrompt dialog
                  }}
                />
              </motion.div>
            )
          )}
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}
