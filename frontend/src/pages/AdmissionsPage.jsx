import { useNavigate } from 'react-router-dom';
import PageBanner from '../components/common/PageBanner';
import SectionTitle from '../components/common/SectionTitle';
import CTA from '../components/CTA/CTA';

function StepCard({ step }) {
  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
      <div className="w-12 h-12 mx-auto rounded-lg bg-primary text-white flex items-center justify-center font-bold mb-4">{step.id}</div>
      <h4 className="font-heading font-semibold text-lg text-text-dark">{step.title}</h4>
      <p className="text-sm text-text-light mt-2">{step.desc}</p>
    </div>
  );
}

export default function AdmissionsPage() {
  const navigate = useNavigate();
  const steps = [
    { id: 1, title: 'Choose Course', desc: 'Select the program that matches your goals.' },
    { id: 2, title: 'Fill Form', desc: 'Provide your basic details and documents.' },
    { id: 3, title: 'Verification', desc: 'Our team will verify your documents.' },
    { id: 4, title: 'Confirmation', desc: 'Receive enrollment confirmation and schedule.' },
  ];

  const fees = [
    { id: 'monthly', title: 'Monthly', price: '$30', desc: 'Flexible monthly plan' },
    { id: 'quarterly', title: 'Quarterly', price: '$85', desc: 'Save 5% with quarterly billing' },
    { id: 'yearly', title: 'Yearly', price: '$320', desc: 'Best value — save 10%' },
  ];

  return (
    <div>
      <PageBanner
        title="Admissions"
        description="Start your journey with Jamia Tul Uloom. Simple steps to get enrolled and start learning with certified scholars."
        breadcrumbs={[{ label: 'Home', href: '#home' }, { label: 'Admissions' }]}
      />

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Admission Steps" description="Follow these simple steps to enroll." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {steps.map((s) => (
              <StepCard key={s.id} step={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Eligibility" description="Basic requirements for enrollment." />
          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h4 className="font-heading font-semibold text-lg">Age Requirements</h4>
              <p className="text-sm text-text-light mt-2">Minimum age 8 years for Hifz and 6 years for basic Quran courses. Some programs accept mature learners.</p>

              <h4 className="font-heading font-semibold text-lg mt-4">Language & Internet</h4>
              <p className="text-sm text-text-light mt-2">Classes in Arabic, Urdu, and English. Stable internet connection for live sessions is recommended.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h4 className="font-heading font-semibold text-lg">Required Documents</h4>
              <ul className="mt-2 text-sm text-text-light space-y-2">
                <li>CNIC / Passport</li>
                <li>Student Photo</li>
                <li>Guardian Details</li>
                <li>Previous Certificate (if any)</li>
              </ul>

              <h4 className="font-heading font-semibold text-lg mt-4">Help</h4>
              <p className="text-sm text-text-light mt-2">Contact our admissions team via WhatsApp or email for assistance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Fee Structure" description="Transparent pricing with premium support." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {fees.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <h4 className="font-heading font-semibold text-xl">{f.title}</h4>
                <div className="text-3xl font-bold text-text-dark mt-4">{f.price}</div>
                <p className="text-sm text-text-light mt-2">{f.desc}</p>
                <div className="mt-6">
                  <a onClick={() => navigate('/admission-form')} className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-2xl shadow-lg cursor-pointer">Apply Now</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Ready to Apply?" description="Fill out the online admission form to get started." />
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button onClick={() => navigate('/admission-form')} className="px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl shadow-lg hover:bg-primary-dark transition-colors">
              Apply Now
            </button>
            <button onClick={() => navigate('/admission-status')} className="px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded-2xl hover:bg-primary hover:text-white transition-colors">
              Check Application Status
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="FAQs" description="Common questions about admissions." />
          <div className="space-y-3 mt-4">
            <details className="bg-white rounded-2xl p-4 shadow-sm">
              <summary className="font-medium cursor-pointer">What is the minimum age for Hifz program?</summary>
              <p className="mt-2 text-text-light">Minimum age is 8 years, but exceptions can be made based on readiness.</p>
            </details>
            <details className="bg-white rounded-2xl p-4 shadow-sm">
              <summary className="font-medium cursor-pointer">Do you offer scholarships?</summary>
              <p className="mt-2 text-text-light">Yes — scholarships are available for exceptional students based on merit and need.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Need Help?" description="Contact our admissions team via WhatsApp, phone, or email." />
          <div className="mt-6 flex flex-wrap gap-4">
            <a className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white">WhatsApp</a>
            <a className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-border-light">Phone</a>
            <a className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-border-light">Email</a>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
