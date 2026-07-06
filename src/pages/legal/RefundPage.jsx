import React from 'react';

export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mb-4">
        Refund Policy
      </h1>
      <p className="text-black/50 font-bold uppercase tracking-widest mb-12">Last Updated: October 2026</p>

      <div className="prose prose-lg prose-black max-w-none">
        <p className="text-xl font-medium leading-relaxed mb-8">
          At CareerNode, we provide digital tools, AI generations, and data access. Due to the immediate nature of these digital goods and services, we enforce a strict refund policy. Please read this policy carefully before making any purchases.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">1. All Sales Are Final</h2>
        <p>
          Unless otherwise mandated by applicable law, all purchases made on the CareerNode platform are final and non-refundable. This applies to:
        </p>
        <ul className="list-disc pl-6 space-y-3 font-medium">
          <li>Monthly or Annual Membership Subscriptions</li>
          <li>Digital Credit Packs (Wallet Top-ups)</li>
          <li>A-La-Carte purchases in the HR Contacts Marketplace</li>
          <li>A-La-Carte purchases in the Job Finder Marketplace</li>
        </ul>
        <p className="font-bold bg-[var(--color-accent-yellow)]/20 p-4 rounded-xl border border-[var(--color-accent-yellow)] mt-6">
          Once digital credits are added to your account or a data bundle is unlocked, they cannot be returned or refunded, regardless of whether they have been utilized.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">2. Subscription Cancellations</h2>
        <p>
          You may cancel your recurring membership subscription at any time through your Billing Settings. When you cancel a subscription:
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>Your cancellation will take effect at the end of the current paid billing cycle.</li>
          <li>You will retain full access to all Pro features and benefits until the billing cycle concludes.</li>
          <li><strong>We do not provide prorated refunds</strong> or credits for any partially used membership periods.</li>
        </ul>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">3. Exceptions & Disputed Charges</h2>
        <p>
          Refunds will only be considered under the following exceptional circumstances, evaluated on a case-by-case basis at our sole discretion:
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Billing Errors:</strong> If you were charged multiple times for a single transaction due to a technical error on our platform.</li>
          <li><strong>Service Outages:</strong> If CareerNode experiences a prolonged, systemic outage exceeding 72 continuous hours that renders you completely unable to use the service you paid for.</li>
        </ul>
        <p>
          If you believe you qualify for an exception, you must contact <a href="mailto:nithinchowdary565@gmail.com" className="font-bold underline">nithinchowdary565@gmail.com</a> within 7 days of the charge in question.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">4. Chargebacks</h2>
        <p>
          If you initiate a chargeback or payment dispute with your bank or credit card provider without first attempting to resolve the issue with our support team, CareerNode reserves the right to immediately suspend or permanently terminate your account and forfeit any remaining credits or active subscriptions.
        </p>
      </div>
    </div>
  );
}
