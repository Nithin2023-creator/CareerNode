import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mb-4">
        Terms & Conditions
      </h1>
      <p className="text-black/50 font-bold uppercase tracking-widest mb-12">Last Updated: October 2026</p>

      <div className="prose prose-lg prose-black max-w-none">
        <p className="text-xl font-medium leading-relaxed mb-8">
          Welcome to CareerNode. By accessing or using our platform, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">1. Use of Service</h2>
        <p>
          CareerNode provides AI-powered tools for job discovery, resume generation, and cold emailing. You agree to use these services only for lawful purposes. You are solely responsible for ensuring that your use of our platform complies with all applicable local, state, and international laws, including data protection regulations (such as GDPR and CCPA) and the Terms of Service of third-party platforms (e.g., LinkedIn, Indeed) from which you may extract or utilize data.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">2. AI-Generated Content & Data Accuracy</h2>
        <p>
          Our platform utilizes Artificial Intelligence (AI) to generate resumes, scrape job postings, and compose emails. CareerNode does not guarantee the accuracy, completeness, or effectiveness of any AI-generated content or scraped data. 
        </p>
        <p className="font-bold bg-[var(--color-accent-yellow)]/20 p-4 rounded-xl border border-[var(--color-accent-yellow)]">
          You acknowledge that AI-generated content may contain errors, omissions, or factual inaccuracies. You are strictly responsible for reviewing and verifying all content (including resumes and emails) before utilizing or distributing it. CareerNode shall bear no liability for any missed employment opportunities, reputational damage, or legal consequences arising from the use of our AI tools.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">3. Cold Emailing & Anti-Spam Compliance</h2>
        <p>
          When using the CareerNode Cold Mailer, you must comply with all applicable anti-spam laws, including but not limited to the CAN-SPAM Act. You agree not to use our platform to send unsolicited promotional material or spam. 
        </p>
        <p>
          You are solely responsible for the content of the emails you send and for managing recipient consent and opt-outs. CareerNode reserves the right to suspend or terminate your account immediately and without refund if we determine, at our sole discretion, that you are engaging in spam or abusive emailing practices.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">4. Intellectual Property</h2>
        <p>
          The CareerNode platform, including its original content, features, proprietary scraping algorithms, and design, are owned by CareerNode and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">5. Limitation of Liability</h2>
        <p className="uppercase font-bold text-sm tracking-wider">
          To the maximum extent permitted by applicable law, in no event shall CareerNode, its affiliates, directors, employees, or agents be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to the use of, or inability to use, this service.
        </p>
        <p className="uppercase font-bold text-sm tracking-wider mt-4">
          Under no circumstances will CareerNode be responsible for any damage, loss, or injury resulting from hacking, tampering, or other unauthorized access or use of the service or your account or the information contained therein. CareerNode's total liability to you for all claims arising out of or related to these terms or your use of the service shall not exceed the amount you paid to CareerNode in the three (3) months preceding the event giving rise to the claim.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">6. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless CareerNode and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password, b) a breach of these Terms, or c) Content posted on the Service.
        </p>

        <h2 className="font-display text-3xl font-bold uppercase mt-12 mb-6 border-b-2 border-black pb-2">7. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which CareerNode operates, without regard to its conflict of law provisions. Any dispute arising from these Terms or the use of the Service shall be resolved exclusively through binding arbitration, rather than in court.
        </p>
      </div>
    </div>
  );
}
