export const EMAIL_CAMPAIGNS = {
  post_first_booking: {
    campaign_name: 'Post First Booking',
    trigger_event: 'booking_completed',
    emails: [
      {
        delay_days: 1,
        subject: '🎉 How was your first cleaning?',
        body: `Hi {client_name},

We hope you loved your cleaning with {cleaner_name}!

Your feedback helps us maintain our high standards. Could you take 2 minutes to leave a review?

{review_link}

P.S. Don't forget—you can book {cleaner_name} again with just one click!

{book_again_link}

Happy cleaning!
The PureTask Team`,
        cta_text: 'Leave a Review',
        cta_url: '/review?booking_id={booking_id}'
      },
      {
        delay_days: 7,
        subject: '✨ Time for a refresh? Book your next cleaning',
        body: `Hi {client_name},

Your home is probably due for another cleaning soon!

Most clients book every 2-4 weeks to keep their homes consistently clean.

{cleaner_name} is available this week. Want to book them again?

{book_again_link}

Or browse other highly-rated cleaners in your area:

{browse_cleaners_link}

Happy cleaning!
The PureTask Team`,
        cta_text: 'Book Again',
        cta_url: '/book-again?cleaner={cleaner_email}'
      },
      {
        delay_days: 14,
        subject: '💡 Did you know? Regular cleanings save you time',
        body: `Hi {client_name},

We've noticed it's been 2 weeks since your last cleaning.

Regular cleaning sessions keep your home consistently fresh and actually save time in the long run!

Many of our clients love setting up recurring bookings so they never have to think about it.

Interested in a weekly or bi-weekly schedule?

{learn_more_link}

Happy cleaning!
The PureTask Team`,
        cta_text: 'Learn More',
        cta_url: '/browse-cleaners'
      },
      {
        delay_days: 30,
        subject: '🏠 We miss you! Here\'s $10 off your next booking',
        body: `Hi {client_name},

It's been a month since your last cleaning. We'd love to have you back!

Use code COMEBACK10 for $10 off your next booking.

{book_now_link}

Valid for the next 7 days!

Happy cleaning!
The PureTask Team`,
        cta_text: 'Book Now',
        cta_url: '/browse-cleaners?promo=COMEBACK10'
      }
    ],
    is_active: true
  },
  
  signup_no_booking: {
    campaign_name: 'Signup No Booking',
    trigger_event: 'signup_no_booking',
    emails: [
      {
        delay_days: 1,
        subject: '👋 Welcome to PureTask! Ready to book your first cleaning?',
        body: `Hi {client_name},

Thanks for signing up! We noticed you haven't booked your first cleaning yet.

Here's what makes PureTask different:
✅ All cleaners are background-checked
✅ GPS tracking and photo proof
✅ Book in 3 minutes
✅ Cancel anytime

Ready to experience the easiest cleaning booking ever?

{browse_cleaners_link}

P.S. Most homes need 2-4 hours for a standard clean.

Happy cleaning!
The PureTask Team`,
        cta_text: 'Browse Cleaners',
        cta_url: '/browse-cleaners'
      },
      {
        delay_days: 3,
        subject: '⭐ See why clients love PureTask (4.9/5 stars)',
        body: `Hi {client_name},

Still thinking about booking? Here's what other clients are saying:

"Best cleaning service I've ever used. The photo proof is amazing!" - Sarah M.

"I love that I can see exactly who's coming to my house. Very professional." - Mike T.

"The GPS tracking gives me peace of mind. I know exactly when they arrive and leave." - Jennifer K.

Join 10,000+ happy clients today!

{browse_cleaners_link}

Happy cleaning!
The PureTask Team`,
        cta_text: 'Book Your First Cleaning',
        cta_url: '/browse-cleaners'
      },
      {
        delay_days: 7,
        subject: '🎁 Special offer: $20 off your first booking',
        body: `Hi {client_name},

We really want you to experience PureTask!

For a limited time, get $20 off your first booking with code FIRST20.

✨ All cleaners verified
✨ Same-day availability
✨ 100% satisfaction guaranteed

Don't miss out—book today!

{browse_cleaners_link}

Happy cleaning!
The PureTask Team`,
        cta_text: 'Claim Your $20 Off',
        cta_url: '/browse-cleaners?promo=FIRST20'
      }
    ],
    is_active: true
  }
};