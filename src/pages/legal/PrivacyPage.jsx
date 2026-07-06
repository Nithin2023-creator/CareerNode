import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mb-4">
        Privacy Policy
      </h1>
      <p className="text-black/50 font-bold uppercase tracking-widest mb-12">Last Updated: October 2026</p>

      <div className="prose prose-lg prose-black max-w-none">
        <p className="text-xl font-medium leading-relaxed mb-8">
          CareerNode ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our SaaS platform.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">1. Information We Collect</h2>
        
        <h3 className="font-bold text-xl mb-3">a. Personal Information</h3>
        <p>
          When you register for a CareerNode account, we may collect personal information such as your name, email address, and profile picture. If you choose to authenticate via Google OAuth, we will receive this basic profile information from Google. We do not access or store your Google password.
        </p>

        <h3 className="font-bold text-xl mb-3 mt-8">b. Usage & AI Interaction Data</h3>
        <p>
          We collect data regarding your interactions with our platform, including the resumes you generate, the job listings you bookmark or scrape, and the cold email templates you create. This data is used to provide the service and improve our AI models.
        </p>

        <h3 className="font-bold text-xl mb-3 mt-8">c. Payment Information</h3>
        <p>
          We use a third-party payment processor, Cashfree, for all billing and payments. CareerNode does not collect, process, or store your credit card details or financial information on our servers. All payment data is securely transmitted directly to Cashfree in compliance with PCI-DSS standards.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>To provide, operate, and maintain our platform.</li>
          <li>To process transactions and send related information, including confirmations and receipts.</li>
          <li>To improve, personalize, and expand our AI tools and services.</li>
          <li>To communicate with you for customer service, updates, and promotional purposes.</li>
          <li>To monitor and analyze trends, usage, and activities in connection with our platform.</li>
          <li>To prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
        </ul>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">3. Data Sharing & Disclosure</h2>
        <p>
          We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers.
        </p>
        <p>
          We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">4. Third-Party Services</h2>
        <p>
          Our platform integrates with third-party services, including OpenAI (or similar LLM providers) for AI generation and Cashfree for payments. When you use our AI tools, the text inputs you provide (such as resume bullet points) are sent to our AI providers for processing. These providers are strictly prohibited from using your data to train their models outside of the scope of providing the API service to us.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">5. Data Retention & Security</h2>
        <p>
          We implement commercially reasonable security measures designed to protect your information from unauthorized access. However, no security system is impenetrable, and we cannot guarantee the absolute security of our systems. We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">6. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:nithinchowdary565@gmail.com" className="font-bold underline">nithinchowdary565@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
