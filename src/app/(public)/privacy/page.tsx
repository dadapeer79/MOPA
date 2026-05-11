
import { PageHeader } from "@/components/page-header";

export default function PrivacyPage() {
  return (
    <div className="container py-12 md:py-20">
      <PageHeader
        title="Privacy Policy"
        description="Last updated: October 26, 2024"
        className="mb-8 items-center text-center"
      />
      <div className="prose prose-lg mx-auto max-w-4xl text-foreground/80">
        <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us. For example, we
          collect information when you create an account, subscribe, participate
          in any interactive features of our services, fill out a form, request
          customer support, or otherwise communicate with us. The types of
          information we may collect include your name, email address, postal
          address, and other contact or identifying information you choose to
          provide.
        </p>
        <h2 className="mt-6 text-xl font-bold text-foreground">2. How We Use Information</h2>
        <p>
          We may use the information we collect to:
        </p>
        <ul className="list-disc pl-6">
          <li>Provide, maintain, and improve our services;</li>
          <li>
            Provide and deliver the products and services you request, process
            transactions, and send you related information;
          </li>
          <li>
            Send you technical notices, updates, security alerts, and support
            and administrative messages;
          </li>
          <li>
            Respond to your comments, questions, and requests, and provide
            customer service.
          </li>
        </ul>
        <h2 className="mt-6 text-xl font-bold text-foreground">3. Sharing of Information</h2>
        <p>
          We do not share your personal information with third parties without
          your consent, except in the following circumstances or as described in
          this Privacy Policy.
        </p>
        <h2 className="mt-6 text-xl font-bold text-foreground">4. Your Choices</h2>
        <p>
          You may update, correct, or delete information about you at any time
          by logging into your online account. If you wish to delete your
          account, please email us, but note that we may retain certain
          information as required by law or for legitimate business purposes.
        </p>
        <h2 className="mt-6 text-xl font-bold text-foreground">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at support@vyapaarsahayak.com.
        </p>
      </div>
    </div>
  );
}
