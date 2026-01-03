/**
 * Verification Service
 * Handles identity verification and background checks through third-party providers
 */

import { base44 } from '@/api/base44Client';

/**
 * Initiate KYC verification with identity service (Persona/Onfido/Stripe Identity)
 * This simulates sending documents to a third-party service
 */
export async function initiateKYCVerification(userEmail, documents) {
  try {
    // In production, this would call actual third-party APIs like:
    // - Persona (persona.com)
    // - Onfido (onfido.com)
    // - Stripe Identity (stripe.com/identity)
    
    // For now, we'll use the LLM integration to simulate verification logic
    const verificationResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an identity verification system. Analyze the following verification request and determine if it should be approved.
      
      User Email: ${userEmail}
      Documents Provided: ${JSON.stringify(documents)}
      
      Check for:
      1. ID document quality (front and back)
      2. Selfie for liveness check
      3. Data consistency
      
      Return a JSON response with:
      - status: "approved", "rejected", or "consider"
      - reason: explanation for the decision
      - confidence: percentage (0-100)
      - flags: array of any concerns`,
      response_json_schema: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["approved", "rejected", "consider"] },
          reason: { type: "string" },
          confidence: { type: "number" },
          flags: { type: "array", items: { type: "string" } }
        }
      }
    });

    return verificationResult;
  } catch (error) {
    console.error('KYC verification error:', error);
    throw new Error('Failed to initiate KYC verification');
  }
}

/**
 * Initiate background check with provider (Checkr/Certn)
 */
export async function initiateBackgroundCheck(userEmail, userData) {
  try {
    // In production, this would call actual background check APIs like:
    // - Checkr (checkr.com)
    // - Certn (certn.co)
    // - GoodHire (goodhire.com)
    
    const bgcResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a background check system. Analyze the following request:
      
      User Email: ${userEmail}
      User Data: ${JSON.stringify(userData)}
      
      Simulate a background check covering:
      1. Criminal records
      2. Employment verification
      3. Reference checks
      
      Return a JSON response with:
      - status: "clear", "consider", or "failed"
      - records_found: boolean
      - severity: "none", "minor", or "major"
      - details: explanation
      - recommendation: whether to approve for platform`,
      response_json_schema: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["clear", "consider", "failed"] },
          records_found: { type: "boolean" },
          severity: { type: "string", enum: ["none", "minor", "major"] },
          details: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    });

    // Map background check statuses to our internal enum
    const mappedStatus = mapBackgroundCheckStatus(bgcResult.status);
    
    return {
      ...bgcResult,
      mapped_status: mappedStatus
    };
  } catch (error) {
    console.error('Background check error:', error);
    throw new Error('Failed to initiate background check');
  }
}

/**
 * Map third-party background check statuses to internal enum
 */
function mapBackgroundCheckStatus(externalStatus) {
  const statusMap = {
    'clear': 'approved',
    'consider': 'consider',
    'failed': 'rejected',
    'pending': 'pending'
  };
  
  return statusMap[externalStatus] || 'pending';
}

/**
 * Check if user is verified and allowed to accept bookings
 */
export function isVerifiedForBookings(user) {
  const kycApproved = user.kyc_status === 'approved';
  const bgcApproved = user.background_check_status === 'approved' || user.background_check_status === 'consider';
  
  return kycApproved && bgcApproved;
}

/**
 * Get verification blocking reason
 */
export function getVerificationBlockingReason(user) {
  if (user.kyc_status === 'rejected') {
    return 'Identity verification failed. Please contact support.';
  }
  
  if (user.background_check_status === 'rejected') {
    return 'Background check did not meet platform requirements.';
  }
  
  if (user.kyc_status === 'pending') {
    return 'Identity verification is still in progress. This typically takes 24-48 hours.';
  }
  
  if (user.background_check_status === 'pending') {
    return 'Background check is still in progress. This typically takes 24-48 hours.';
  }
  
  return 'Verification incomplete.';
}