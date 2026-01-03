import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export async function createSubscription(bookingData, cleanerProfile, clientUser) {
  try {
    const startDate = new Date();
    const contractEndDate = new Date(startDate);
    contractEndDate.setMonth(contractEndDate.getMonth() + 3); // 3-month minimum commitment
    
    const subscription = await base44.entities.CleaningSubscription.create({
      client_email: clientUser.email,
      cleaner_email: cleanerProfile.user_email,
      plan_type: bookingData.subscription_plan,
      day_of_week: new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long' }),
      preferred_time: bookingData.startTime,
      hours_per_cleaning: bookingData.hours,
      tasks: bookingData.tasks,
      task_quantities: bookingData.taskQuantities || {},
      address: bookingData.address,
      latitude: bookingData.latitude,
      longitude: bookingData.longitude,
      monthly_price: bookingData.monthly_price,
      price_per_cleaning: bookingData.total_price,
      discount_percentage: 20,
      status: 'active',
      next_cleaning_date: bookingData.date,
      started_date: startDate.toISOString(),
      total_cleanings_completed: 0,
      total_amount_paid: 0,
      auto_renew: true
    });
    
    // Create or update ClientMembership with 3-month commitment
    const existingMemberships = await base44.entities.ClientMembership.filter({
      client_email: clientUser.email,
      status: 'active'
    });
    
    if (existingMemberships.length === 0) {
      await base44.entities.ClientMembership.create({
        client_email: clientUser.email,
        tier: bookingData.membership_tier || 'Plus',
        monthly_fee: bookingData.monthly_price,
        minimum_commitment_months: 3,
        contract_end_date: contractEndDate.toISOString(),
        started_date: startDate.toISOString(),
        status: 'active',
        benefits: {
          discount_percentage: 20,
          priority_booking: true,
          free_cancellations: false,
          insurance_included: false,
          dedicated_support: false
        }
      });
    }

    // Send confirmation email
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: clientUser.email,
      subject: '🎉 Your PureTask Subscription is Active!',
      body: `Congratulations! Your ${bookingData.subscription_plan} cleaning subscription is now active.

Plan Details:
• Cleaner: ${cleanerProfile.full_name}
• Frequency: ${bookingData.subscription_plan}
• Day: ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long' })}
• Time: ${bookingData.startTime}
• Monthly Price: $${bookingData.monthly_price.toFixed(2)}
• You Save: 20% on every cleaning!

⚠️ IMPORTANT: 3-Month Minimum Commitment
This subscription requires a 3-month minimum commitment ending on ${contractEndDate.toLocaleDateString()}.
If you cancel before this date, you will be charged for the remaining months of your contract.

Your first cleaning is scheduled for ${bookingData.date}.

You can pause or cancel your subscription anytime from your dashboard.

Manage your subscription: ${baseUrl}${createPageUrl('ClientDashboard')}

Happy cleaning!
The PureTask Team`
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function generateNextBooking(subscriptionId) {
  try {
    const subscription = await base44.entities.CleaningSubscription.get(subscriptionId);
    
    if (subscription.status !== 'active') return null;
    
    // Calculate next date based on plan type
    const lastDate = new Date(subscription.next_cleaning_date);
    let nextDate;
    
    switch (subscription.plan_type) {
      case 'weekly':
        nextDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'biweekly':
        nextDate = new Date(lastDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        return null;
    }
    
    // Create booking
    const booking = await base44.entities.Booking.create({
      client_email: subscription.client_email,
      cleaner_email: subscription.cleaner_email,
      date: nextDate.toISOString().split('T')[0],
      start_time: subscription.preferred_time,
      hours: subscription.hours_per_cleaning,
      tasks: subscription.tasks,
      task_quantities: subscription.task_quantities || {},
      address: subscription.address,
      latitude: subscription.latitude,
      longitude: subscription.longitude,
      total_price: subscription.price_per_cleaning,
      status: 'scheduled',
      subscription_id: subscription.id,
      client_confirmed: true,
      cleaner_confirmed: true
    });
    
    // Update subscription
    await base44.entities.CleaningSubscription.update(subscriptionId, {
      next_cleaning_date: nextDate.toISOString().split('T')[0]
    });
    
    // Send reminder email
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: subscription.client_email,
      subject: '🗓️ Your next cleaning is scheduled',
      body: `Your ${subscription.plan_type} cleaning is coming up!

Date: ${nextDate.toLocaleDateString()}
Time: ${subscription.preferred_time}
Cleaner: ${subscription.cleaner_email}

As a subscription member, this booking is automatically confirmed. No action needed from you!

View details: ${baseUrl}${createPageUrl('ClientDashboard')}

Happy cleaning!
The PureTask Team`
    });
    
    return booking;
  } catch (error) {
    console.error('Error generating next booking:', error);
    throw error;
  }
}

export async function generateAllNextBookings() {
  console.log('🔄 Generating next bookings for active subscriptions...');
  
  try {
    const subscriptions = await base44.entities.CleaningSubscription.filter({
      status: 'active'
    });
    
    let generatedCount = 0;
    
    for (const sub of subscriptions) {
      try {
        const nextDate = new Date(sub.next_cleaning_date);
        const now = new Date();
        const daysUntil = (nextDate - now) / (1000 * 60 * 60 * 24);
        
        if (daysUntil <= 7) {
          const existing = await base44.entities.Booking.filter({
            subscription_id: sub.id,
            date: sub.next_cleaning_date
          });
          
          if (existing.length === 0) {
            await generateNextBooking(sub.id);
            generatedCount++;
            console.log(`✅ Generated booking for subscription ${sub.id}`);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to generate booking for subscription ${sub.id}:`, error);
      }
    }
    
    console.log(`✨ Generated ${generatedCount} new bookings`);
    return { success: true, generated: generatedCount };
  } catch (error) {
    console.error('❌ Critical error in subscription generation:', error);
    return { success: false, error: error.message };
  }
}