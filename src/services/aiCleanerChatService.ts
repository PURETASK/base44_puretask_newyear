// AI Chat Assistant Service
// Context-aware AI helper for cleaners using Base44 LLM integration

import { base44 } from '@/api/base44Client';
import type { JobRecord } from '@/types/cleanerJobTypes';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: {
    jobId?: string;
    jobState?: string;
    suggestedActions?: string[];
  };
}

export interface CleanerContext {
  cleanerId: string;
  cleanerEmail: string;
  currentJob?: JobRecord;
  stats?: {
    totalJobs: number;
    reliabilityScore: number;
    avgRating: number;
    totalEarnings: number;
  };
}

export class AICleanerChatService {
  
  // Generate system prompt based on cleaner context
  private buildSystemPrompt(context: CleanerContext): string {
    const job = context.currentJob;
    const stats = context.stats;
    
    let prompt = `You are PureTask AI Assistant, a helpful and friendly AI that helps professional cleaners succeed on the platform.

Your role:
- Help cleaners understand job requirements
- Provide guidance on the job workflow
- Answer questions about payments, policies, and best practices
- Give personalized tips to improve reliability and earnings
- Suggest optimal scheduling and route planning

Important guidelines:
- Be concise and actionable
- Use encouraging, supportive tone
- Reference specific job details when relevant
- Suggest practical next steps
- Focus on helping the cleaner succeed

Current cleaner profile:`;

    if (stats) {
      prompt += `
- Total jobs completed: ${stats.totalJobs}
- Reliability score: ${stats.reliabilityScore}%
- Average rating: ${stats.avgRating}/5.0
- Total earnings: $${stats.totalEarnings.toFixed(2)}`;
    }

    if (job) {
      prompt += `

Current job context:
- Job ID: ${job.id}
- State: ${job.state}
- Address: ${job.address}
- Date: ${job.date} at ${job.time}
- Duration: ${job.duration_hours} hours
- Cleaning type: ${job.cleaning_type}
- Bedrooms: ${job.bedrooms}, Bathrooms: ${job.bathrooms}`;

      if (job.state === 'ASSIGNED') {
        prompt += `\n- Next action: Mark en route when heading to the job`;
      } else if (job.state === 'EN_ROUTE') {
        prompt += `\n- Next action: Check in when within 250m of the address`;
      } else if (job.state === 'ARRIVED') {
        prompt += `\n- Next action: Start the job to begin timer`;
      } else if (job.state === 'IN_PROGRESS') {
        if (job.start_at) {
          const start = new Date(job.start_at);
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
          prompt += `\n- Job in progress: ${elapsed} minutes elapsed`;
        }
        prompt += `\n- Before photos: ${job.before_photos_count || 0}/3`;
        prompt += `\n- After photos: ${job.after_photos_count || 0}/3`;
        prompt += `\n- Next action: Upload photos and complete job when done`;
      } else if (job.state === 'AWAITING_CLIENT_REVIEW') {
        prompt += `\n- Status: Waiting for client to approve and release payment`;
      }
    }

    prompt += `\n\nRespond helpfully and concisely. If the cleaner needs to take an action, guide them clearly.`;

    return prompt;
  }

  // Get contextual quick actions based on job state
  getQuickActions(job?: JobRecord): Array<{ label: string; question: string }> {
    if (!job) {
      return [
        { label: '📍 How do job offers work?', question: 'How do I receive and accept job offers?' },
        { label: '💰 How do I get paid?', question: 'Explain the payment process and timeline' },
        { label: '⭐ What affects my reliability score?', question: 'What factors affect my reliability score?' },
        { label: '📅 How should I manage my schedule?', question: 'Give me tips for managing my cleaning schedule' }
      ];
    }

    const state = job.state;
    
    if (state === 'ASSIGNED') {
      return [
        { label: '🗺️ How to mark en route?', question: 'How do I mark that I\'m on my way to the job?' },
        { label: '📍 What if I\'m running late?', question: 'What should I do if I\'m running late to the job?' },
        { label: '🚗 Best route planning?', question: 'What\'s the best way to plan my route to the job?' },
        { label: '❌ Need to cancel?', question: 'How do I cancel this job if needed?' }
      ];
    }

    if (state === 'EN_ROUTE') {
      return [
        { label: '📍 GPS check-in help', question: 'How does GPS check-in work?' },
        { label: '❓ What\'s the 250m requirement?', question: 'Why do I need to be within 250 meters?' },
        { label: '🔧 GPS not working?', question: 'My GPS isn\'t working, what should I do?' },
        { label: '🏠 Arrived early?', question: 'I arrived early, what should I do?' }
      ];
    }

    if (state === 'ARRIVED' || state === 'IN_PROGRESS') {
      return [
        { label: '📸 Photo requirements?', question: 'What photos do I need to take and why?' },
        { label: '⏱️ Need more time?', question: 'How do I request extra time for this job?' },
        { label: '🧹 What cleaning tasks?', question: 'What tasks should I focus on for this job type?' },
        { label: '❓ Client not home?', question: 'The client isn\'t home, what should I do?' }
      ];
    }

    if (state === 'AWAITING_CLIENT_REVIEW') {
      return [
        { label: '⏰ How long for approval?', question: 'How long does client approval usually take?' },
        { label: '💰 When do I get paid?', question: 'When will I receive payment for this job?' },
        { label: '⭐ What if low rating?', question: 'What happens if the client gives a low rating?' },
        { label: '🔄 Next job tips?', question: 'What should I do while waiting for approval?' }
      ];
    }

    return [
      { label: '❓ General help', question: 'I have a general question about this job' },
      { label: '💡 Tips for this job', question: 'Give me tips for completing this job successfully' },
      { label: '📞 Contact support?', question: 'How do I contact support if I need help?' }
    ];
  }

  // Get AI response
  async chat(
    messages: ChatMessage[],
    context: CleanerContext
  ): Promise<string> {
    try {
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add system prompt at the beginning
      const systemPrompt = this.buildSystemPrompt(context);
      
      const fullConversation = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory
      ];

      // Call Base44 LLM integration
      const response = await base44.integrations.Core.InvokeLLM({
        model: 'gpt-4',
        messages: fullConversation,
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI chat error:', error);
      return 'I\'m having trouble connecting right now. Please try again or contact support if you need immediate help.';
    }
  }

  // Get job-specific tips
  async getJobTips(job: JobRecord, context: CleanerContext): Promise<string> {
    const prompt = `Based on this job (${job.cleaning_type} cleaning, ${job.bedrooms}BR/${job.bathrooms}BA, ${job.duration_hours}hrs), give me 3 specific tips to complete it successfully and efficiently.`;
    
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }
    ];

    return await this.chat(messages, context);
  }

  // Get earnings optimization suggestions
  async getEarningsOptimization(context: CleanerContext): Promise<string> {
    const prompt = `Based on my stats (${context.stats?.totalJobs} jobs, ${context.stats?.reliabilityScore}% reliability, $${context.stats?.totalEarnings} earned), what are 3 specific ways I can increase my earnings on PureTask?`;
    
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }
    ];

    return await this.chat(messages, context);
  }

  // Get schedule recommendations
  async getScheduleRecommendations(context: CleanerContext): Promise<string> {
    const prompt = `Based on my performance (${context.stats?.reliabilityScore}% reliability), suggest optimal times and strategies for accepting jobs to maximize my earnings and work-life balance.`;
    
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }
    ];

    return await this.chat(messages, context);
  }

  // Analyze job offer and recommend acceptance
  async analyzeJobOffer(job: JobRecord, context: CleanerContext): Promise<{
    recommendation: 'accept' | 'consider' | 'pass';
    reasons: string[];
    estimatedEarnings: number;
    estimatedTime: number;
  }> {
    const baseRate = 40; // $40/hour (TODO: get from pricing)
    const estimatedEarnings = job.duration_hours * baseRate * 0.8; // 80% payout
    
    const reasons: string[] = [];
    let recommendation: 'accept' | 'consider' | 'pass' = 'consider';

    // Factors to consider
    const isHighPaying = estimatedEarnings > 80;
    const isNearby = true; // TODO: calculate distance from cleaner's location
    const isGoodTiming = true; // TODO: check against cleaner's schedule
    const matchesExpertise = job.cleaning_type === 'basic'; // TODO: check cleaner's specialty

    if (isHighPaying) {
      reasons.push('💰 High earnings potential');
    }
    
    if (isNearby) {
      reasons.push('📍 Close to your location');
    }
    
    if (isGoodTiming) {
      reasons.push('⏰ Fits your schedule well');
    }
    
    if (matchesExpertise) {
      reasons.push('⭐ Matches your expertise');
    }

    // Decision logic
    if (reasons.length >= 3) {
      recommendation = 'accept';
    } else if (reasons.length >= 2) {
      recommendation = 'consider';
    } else {
      recommendation = 'pass';
      reasons.push('⚠️ May not be optimal for your schedule');
    }

    return {
      recommendation,
      reasons,
      estimatedEarnings,
      estimatedTime: job.duration_hours * 60
    };
  }

  // Get FAQ answer
  async getFAQAnswer(question: string): Promise<string> {
    const faqMap: Record<string, string> = {
      'payment': 'You get paid 18 hours after client approval. Earnings are automatically deposited to your account. Instant cash-out is available for a 10% fee.',
      'reliability': 'Your reliability score is based on: accepting jobs (20%), showing up on time (30%), completing jobs (30%), and client ratings (20%). Maintain 90%+ for Gold tier.',
      'photos': 'You must take 3 before and 3 after photos. This protects both you and the client by documenting the work completed. Photos are required to complete the job.',
      'gps': 'GPS check-in proves you\'re at the correct location (within 250 meters). This prevents fraud and builds trust. Make sure location services are enabled.',
      'cancel': 'You can cancel up to 4 hours before the job. Late cancellations hurt your reliability score. Contact support for emergencies.',
      'dispute': 'If there\'s an issue, document everything with photos and notes. Contact support within 24 hours. Most disputes are resolved in 2-3 business days.'
    };

    const lowerQuestion = question.toLowerCase();
    
    for (const [key, answer] of Object.entries(faqMap)) {
      if (lowerQuestion.includes(key)) {
        return answer;
      }
    }

    // Fall back to AI for unknown questions
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'user',
        content: question,
        timestamp: new Date()
      }
    ];

    return await this.chat(messages, {
      cleanerId: '',
      cleanerEmail: ''
    });
  }
}

// Singleton instance
export const aiCleanerChatService = new AICleanerChatService();

