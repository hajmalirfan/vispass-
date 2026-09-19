import type { FC } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: '1. Information We Collect',
    content: (
      <>
        <p>Depending on the user's role and use of the system, VISPASS may collect:</p>
        <h3>Account Information</h3>
        <ul><li>Name</li><li>Email address</li><li>Phone number</li><li>User role</li><li>Login and authentication information</li></ul>
        <h3>Visitor Information</h3>
        <ul><li>Full name, phone number, email address, organization, and purpose of visit</li><li>Profile photograph, where required</li><li>Identification proof uploaded by the visitor</li></ul>
        <h3>Event and Gate Pass Information</h3>
        <ul><li>Event name, description, date, time, location, and registration details</li><li>Visitor approval or rejection status</li><li>QR or gate-pass identifier, issue information, check-in time, check-out time, and entry verification status</li></ul>
        <h3>Technical Information</h3>
        <p>The system may process basic technical information required to operate and secure the application, such as IP address, browser information, authentication or session information, and system logs.</p>
      </>
    ),
  },
  {
    title: '2. How We Use Information',
    content: <ul><li>Create and manage user accounts.</li><li>Authenticate users securely.</li><li>Manage events and visitor registrations.</li><li>Allow hosts to approve or reject visitor applications.</li><li>Generate and verify QR-based gate passes.</li><li>Record visitor check-in and check-out.</li><li>Maintain security and audit records.</li><li>Send authentication or notification emails.</li><li>Prevent unauthorized access and misuse.</li><li>Maintain and improve the system.</li></ul>,
  },
  {
    title: '3. Information Sharing',
    content: <><p>VISPASS does not sell personal information. Information may be accessible to authorized users according to their assigned role:</p><ul><li><strong>Hosts</strong> may access visitor information related to their events.</li><li><strong>Checkers or security staff</strong> may access information required to verify gate passes and visitor entry.</li><li><strong>Administrators</strong> may access information necessary for system administration and security.</li></ul><p>VISPASS may use trusted hosting, database, email, and infrastructure providers to operate the system.</p></>,
  },
  {
    title: '4. QR Codes and Gate Passes',
    content: <p>VISPASS generates a unique QR-based gate pass for approved registrations. The QR code identifies and verifies the corresponding registration; it does not by itself grant access. Users should not share their gate pass or QR code with unauthorized persons.</p>,
  },
  {
    title: '5. Data Security',
    content: <><p>We use reasonable technical and organizational measures to protect information, including:</p><ul><li>Role-Based Access Control (RBAC)</li><li>Password hashing and authentication mechanisms</li><li>HTTPS/TLS for network communication</li><li>Database access controls</li><li>Input validation, API security controls, and audit logging</li></ul><p>No internet-based system can guarantee absolute security.</p></>,
  },
  {
    title: '6. Data Retention',
    content: <p>Personal information and visitor records may be retained as long as necessary to provide the service, maintain event and attendance records, meet operational or security requirements, resolve disputes or incidents, and comply with applicable legal requirements. Retention periods may vary by information type and the organization operating VISPASS.</p>,
  },
  {
    title: '7. Identification Documents',
    content: <p>If identification proof is required for an event, visitors should provide only the information requested by the organization. Access to identification documents should be restricted to authorized personnel who require them for visitor verification or event security.</p>,
  },
  {
    title: '8. Email and OTP Authentication',
    content: <p>VISPASS may use an email delivery service to send authentication codes or notifications. Authentication credentials and API keys used by the system should be stored securely and must not be exposed through the frontend application.</p>,
  },
  {
    title: '9. User Responsibilities',
    content: <ul><li>Provide accurate information.</li><li>Keep login credentials and OTPs confidential.</li><li>Do not share QR gate passes with unauthorized individuals.</li><li>Do not upload documents belonging to another person without authorization.</li><li>Use the system only for legitimate purposes.</li></ul>,
  },
  {
    title: "10. Children's Privacy",
    content: <p>VISPASS is not specifically designed to collect information from children. If information belonging to a child is required for an event, the organization responsible should ensure appropriate consent and safeguards where required by applicable law.</p>,
  },
  {
    title: '11. Third-Party Services',
    content: <p>VISPASS may rely on third-party infrastructure and services for hosting, databases, email delivery, authentication, analytics, or other technical functions. Those services may process information according to their own privacy policies and applicable agreements.</p>,
  },
  {
    title: '12. Changes to This Policy',
    content: <p>We may update this Privacy Policy when the system, services, or applicable requirements change. The updated version will be published through the VISPASS application with a revised Last Updated date.</p>,
  },
];

const PrivacyPolicyPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/vispass-logo.png" alt="VisPass logo" className="brand-logo w-28 h-10" />
            <div className="hidden border-l border-gray-200 pl-3 sm:block">
              <p className="text-sm font-bold text-gray-900">Privacy Policy</p>
              <p className="text-xs text-gray-500">Last updated: September 19, 2026</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
            <div><h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">VISPASS Privacy Policy</h1><p className="mt-2 text-sm leading-6 text-gray-600">VISPASS is a Visitor Entry and Gate Pass Management System designed to manage event registration, visitor approvals, QR-based gate passes, and visitor entry records.</p></div>
          </div>
        </div>

        <article className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          {sections.map((section) => <section key={section.title} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"><h2 className="text-lg font-bold text-gray-900">{section.title}</h2><div className="policy-copy mt-3 text-sm leading-7 text-gray-600">{section.content}</div></section>)}

          <section className="border-b border-gray-100 pb-6"><h2 className="text-lg font-bold text-gray-900">13. Contact</h2><p className="mt-3 text-sm leading-7 text-gray-600">For privacy-related questions, requests, or concerns, contact:</p><a href="mailto:care.securix@gmail.com" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"><Mail className="h-4 w-4" /> care.securix@gmail.com</a></section>

          <section><h2 className="text-lg font-bold text-gray-900">Application Created By</h2><div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-600"><p className="font-bold text-gray-900">Hajmal Irfan Mohamed Rafeek</p><p>III Year Cyber Security Student</p><p>B.E. CSE - Cyber Security</p><p>J. J. College of Engineering &amp; Technology</p><p className="mt-2"><strong>Project:</strong> VISPASS - Visitor Entry &amp; Gate Pass Management System</p><p><strong>Contact:</strong> <a href="mailto:care.securix@gmail.com" className="text-blue-600 hover:text-blue-700">care.securix@gmail.com</a></p></div></section>
        </article>

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">This is a practical product-policy draft, not a determination that VISPASS complies with every privacy law. The organization operating VISPASS should review it for applicable jurisdictions and data practices.</p>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;