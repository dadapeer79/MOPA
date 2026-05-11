
import { PageHeader } from "@/components/page-header";

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-20">
      <PageHeader
        title="Terms of Service"
        description="Last updated: October 26, 2024"
        className="mb-8 items-center text-center"
      />
      <div className="prose prose-lg mx-auto max-w-4xl text-foreground/80">
        <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
        <p>
          Welcome to Vyapaar Sahayak! These Terms of Service govern your use of our
          application and provide information about the Vyapaar Sahayak Service,
          outlined below. When you create a Vyapaar Sahayak account or use
          Vyapaar Sahayak, you agree to these terms.
        </p>
        <h2 className="mt-6 text-xl font-bold text-foreground">2. The Vyapaar Sahayak Service</h2>
        <p>
          We agree to provide you with the Vyapaar Sahayak Service. The Service
          includes all of the Vyapaar Sahayak products, features, applications,
          services, technologies, and software that we provide to advance
          Vyapaar Sahayak's mission: To help small and medium enterprises manage
          their business efficiently.
        </p>
        <h2 className="mt-6 text-xl font-bold text-foreground">3. Your Commitments</h2>
        <p>
          In return for our commitment to provide the Service, we require you to
          make the below commitments to us.
        </p>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Who Can Use Vyapaar Sahayak.</h3>
        <p>
          You must be at least 18 years old to use Vyapaar Sahayak. You must not
          be prohibited from receiving any aspect of our Service under
          applicable laws or engaging in payments related Services if you are on
          an applicable denied party listing.
        </p>
        <h3 className="mt-4 text-lg font-semibold text-foreground">How You Can&apos;t Use Vyapaar Sahayak.</h3>
        <p>
          You can&apos;t do anything unlawful, misleading, or fraudulent or for an
          illegal or unauthorized purpose.
        </p>
        <h2 className="mt-6 text-xl font-bold text-foreground">4. Termination</h2>
        <p>
          We may terminate or suspend your account at any time, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach the Terms.
        </p>
        <h2 className="mt-6 text-xl font-bold text-foreground">5. Disclaimer</h2>
        <p>
          The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The
          Service is provided without warranties of any kind, whether express or
          implied.
        </p>
      </div>
    </div>
  );
}
