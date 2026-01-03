import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfService({ userType }) {
  const content = {
    client: {
      title: "Client Terms of Service",
      sections: [
        { 
          title: "1. Services & Platform", 
          text: "PureTask provides a marketplace to connect with independent cleaning professionals. We do not provide cleaning services ourselves. You are responsible for vetting and selecting your cleaner. All cleaners undergo identity verification and background checks, but you should exercise your own judgment." 
        },
        { 
          title: "2. Bookings & Cancellations", 
          text: "Bookings must be confirmed by both parties. Cancellations made less than 24 hours before the scheduled time may incur a fee based on your membership tier. Grace cancellations are available for certain membership levels. We reserve the right to reassign cleaners if necessary. Repeated late cancellations may result in account restrictions." 
        },
        { 
          title: "3. Payments & Credits", 
          text: "All payments are processed through our credit-based system (10 credits = $1 USD). Credits are held in escrow until the job is marked complete and approved. Disputes must be filed within 48 hours of job completion. Refunds, if approved, will be issued as credits to your account." 
        },
        { 
          title: "4. Client Responsibilities", 
          text: "You agree to provide a safe work environment, accurate home information, clear access instructions, and timely communication. You must disclose any pets, allergies, or special requirements. Any damage to cleaner property or safety incidents must be reported immediately." 
        },
        { 
          title: "5. Liability & Insurance", 
          text: "PureTask is not liable for any loss, theft, or damage that occurs during a cleaning session. Optional insurance coverage can be purchased at booking. Cleaners carry their own liability insurance, but claims must be filed directly with the cleaner or their insurance provider." 
        },
        { 
          title: "6. Reviews & Ratings", 
          text: "You may leave honest reviews after job completion. Reviews must be factual and not contain abusive, discriminatory, or defamatory content. PureTask reserves the right to remove reviews that violate our community guidelines." 
        }
      ]
    },
    cleaner: {
      title: "Independent Contractor Agreement & Terms of Service",
      sections: [
        { 
          title: "1. Independent Contractor Status", 
          text: "You acknowledge and agree that you are an independent contractor, not an employee, partner, or agent of PureTask. You are solely responsible for your own federal, state, and local taxes, including self-employment taxes, income taxes, and any applicable sales or use taxes. You are not entitled to employee benefits, workers' compensation, unemployment insurance, or any other statutory employment benefits. You maintain complete control over when, where, and how you perform cleaning services." 
        },
        { 
          title: "2. Platform Usage & Account", 
          text: "By using PureTask, you agree to maintain a professional demeanor at all times, adhere to client instructions and preferences, follow all platform guidelines, and maintain accurate profile information. You must complete all required verifications including identity verification (KYC), background checks, and insurance documentation for Pro/Elite tiers. Account sharing or allowing others to use your account is strictly prohibited and will result in immediate termination." 
        },
        { 
          title: "3. Service Standards & Quality", 
          text: "You agree to arrive on time to all scheduled bookings, complete GPS check-in and check-out verification, upload before and after photos as required, use appropriate and safe cleaning products, respect client property and privacy, and complete work to a professional standard. Failure to meet these standards will negatively impact your reliability score and may result in account suspension or termination." 
        },
        { 
          title: "4. Reliability Score & Tiering", 
          text: "Your reliability score is calculated based on multiple factors including attendance rate, punctuality, photo compliance, completion confirmation, communication responsiveness, cancellation rate, dispute rate, and client ratings. Your tier (Developing, Semi Pro, Pro, Elite) determines your visibility, earning potential, and account privileges. Scores are updated in real-time and may affect your ability to receive bookings. Repeated poor performance may result in tier demotion or account deactivation." 
        },
        { 
          title: "5. Payments, Fees & Payouts", 
          text: "All client payments are processed through PureTask's credit system. You will earn 80% of booking credits for standard cleaners, or 85% for Elite tier cleaners. Credits are converted to USD at a rate of 10 credits = $1 USD. The platform retains a 15-20% service fee to cover payment processing, insurance, platform maintenance, customer support, and administrative costs. Payouts are processed weekly via direct deposit or Stripe transfers. Instant payouts are available for a 5% processing fee. All earnings must be reported as self-employment income for tax purposes. 1099 forms will be provided annually for earnings over $600." 
        },
        { 
          title: "6. Booking Acceptance & Cancellations", 
          text: "You are not required to accept any booking request. You have up to 24 hours to respond to booking requests unless you've enabled instant booking. If you cancel a confirmed booking less than 24 hours before the scheduled time, you may incur a cancellation fee and your reliability score will be negatively impacted. Repeated last-minute cancellations may result in account suspension. Emergency cancellations with valid documentation may be excused on a case-by-case basis." 
        },
        { 
          title: "7. Insurance & Liability", 
          text: "You are solely responsible for obtaining and maintaining your own liability insurance coverage. Pro and Elite tier cleaners are required to provide proof of general liability insurance. You agree to indemnify and hold harmless PureTask from any claims, damages, or liabilities arising from your provision of cleaning services, including but not limited to property damage, personal injury, theft, or loss. You are responsible for any damage you cause to client property and must report incidents immediately through the platform." 
        },
        { 
          title: "8. Background Checks & Verification", 
          text: "You consent to PureTask conducting comprehensive background checks, including criminal history, identity verification (KYC/AML compliance), employment verification, and reference checks. You authorize PureTask to use third-party services (Persona, Checkr, or similar providers) for verification purposes. You understand that background check results will affect your account status. Providing false information or failing verification checks will result in immediate account termination. Background checks may be re-run periodically at PureTask's discretion." 
        },
        { 
          title: "9. Client Relationships & Direct Contact", 
          text: "All bookings must be processed through the PureTask platform. You may not solicit clients for off-platform bookings or accept direct payments outside of PureTask. Violations will result in immediate account termination and forfeiture of pending earnings. You may exchange contact information with clients for legitimate booking-related communication, but all transactions must flow through the platform. If a client approaches you for off-platform work, you must decline and direct them to book through PureTask." 
        },
        { 
          title: "10. Products & Equipment", 
          text: "You are responsible for providing your own cleaning products, equipment, and supplies unless otherwise agreed with the client. You must use safe, appropriate, and effective cleaning products. If you advertise eco-friendly or premium products in your profile, you must use those products on jobs. You may upload product verification photos to build trust with clients. Any product-related issues or allergic reactions must be reported immediately." 
        },
        { 
          title: "11. Safety & Conduct", 
          text: "You agree to maintain professional conduct at all times, respect client privacy and property, follow all safety protocols and OSHA guidelines, report any unsafe conditions immediately, and never work under the influence of drugs or alcohol. You must not engage in any discriminatory, harassing, or inappropriate behavior. Any violations of conduct policies will result in immediate account suspension pending investigation." 
        },
        { 
          title: "12. Data, Privacy & GPS Tracking", 
          text: "You consent to PureTask collecting and storing your personal information, profile data, job history, GPS location data during check-in/check-out, uploaded photos, and communication history. GPS tracking is used solely to verify your arrival and departure from job sites and to ensure client safety. Your location data will not be shared with third parties except as required by law. You may review our Privacy Policy for full details on data handling." 
        },
        { 
          title: "13. Disputes & Resolution", 
          text: "In the event of a dispute with a client regarding job quality, payment, or other issues, you must report the dispute through the PureTask platform within 48 hours. PureTask will mediate disputes in good faith and make final determinations based on available evidence including photos, GPS data, messages, and client feedback. You agree to cooperate fully with dispute resolution processes. Decisions made by PureTask regarding dispute outcomes are final and binding. Repeated disputes may negatively affect your account standing." 
        },
        { 
          title: "14. Intellectual Property", 
          text: "You grant PureTask a non-exclusive, worldwide license to use your name, likeness, profile photos, and reviews for marketing and promotional purposes. PureTask retains all rights to its platform, technology, branding, and content. You may not copy, modify, or create derivative works of the PureTask platform." 
        },
        { 
          title: "15. Termination & Account Closure", 
          text: "Either party may terminate this agreement at any time with or without cause. PureTask reserves the right to suspend or terminate your account immediately for violations of these terms, including but not limited to fraudulent activity, repeated policy violations, poor reliability scores, safety violations, or off-platform solicitation. Upon termination, you will receive any earned but unpaid funds, minus any fees or penalties owed. You may voluntarily close your account at any time through account settings, and your data will be retained as required by law." 
        },
        { 
          title: "16. Changes to Terms", 
          text: "PureTask reserves the right to modify these terms at any time. You will be notified of material changes via email and in-app notifications. Continued use of the platform after changes are posted constitutes acceptance of the new terms. If you do not agree to modified terms, you must discontinue use of the platform." 
        },
        { 
          title: "17. Limitation of Liability", 
          text: "PureTask's total liability to you for any claims arising from these terms or your use of the platform shall not exceed the total fees you earned through the platform in the 12 months preceding the claim. PureTask is not liable for any indirect, incidental, consequential, or punitive damages. This limitation applies to the fullest extent permitted by law." 
        },
        { 
          title: "18. Arbitration & Governing Law", 
          text: "Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive your right to a jury trial or to participate in a class action lawsuit. These terms are governed by the laws of the State of California, without regard to conflict of law principles. Arbitration proceedings will take place in Sacramento, California." 
        },
        { 
          title: "19. Severability", 
          text: "If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable." 
        },
        { 
          title: "20. Entire Agreement", 
          text: "These terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and PureTask regarding your use of the platform and supersede all prior agreements and understandings." 
        }
      ]
    }
  };

  const selectedContent = content[userType] || content.client;

  return (
    <Card className="h-96 overflow-y-auto border-slate-300 rounded-2xl">
      <CardContent className="p-6">
        <h3 className="text-xl font-fredoka font-bold mb-4" style={{ color: '#1D2533' }}>
          {selectedContent.title}
        </h3>
        <div className="space-y-4 text-sm font-verdana" style={{ color: '#4B5563' }}>
          {selectedContent.sections.map((section, index) => (
            <div key={index} className="pb-3 border-b border-gray-100 last:border-0">
              <h4 className="font-fredoka font-semibold mb-2" style={{ color: '#1D2533' }}>
                {section.title}
              </h4>
              <p className="leading-relaxed text-gray-600">
                {section.text}
              </p>
            </div>
          ))}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <p className="text-sm font-fredoka font-semibold" style={{ color: '#1D2533' }}>
              By checking the box below, you acknowledge that you have read, understood, and agree to be bound by these complete Terms of Service.
            </p>
            <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
              Last updated: November 11, 2024
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}