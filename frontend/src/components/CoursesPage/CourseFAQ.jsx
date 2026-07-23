import { useState } from 'react';
import coursesData from '../../data/coursesData';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';

export default function CourseFAQ() {
  const { faqs } = coursesData;
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="FAQ"
          title="Frequently Asked Questions"
          description="Find answers to common questions about our programs and enrollment."
        />

        <div className="max-w-3xl mx-auto space-y-3 lg:space-y-4">
          {faqs.map((faq) => (
            <ScrollReveal key={faq.id}>
              <div className="bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-500">
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between px-6 lg:px-8 py-5 text-left transition-colors duration-300 hover:bg-primary-light/30"
                aria-expanded={openId === faq.id}
              >
                <span className="font-heading text-base lg:text-lg font-bold text-text-dark pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 text-primary transition-transform duration-300 ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openId === faq.id ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 lg:px-8 pb-5">
                  <p className="text-sm sm:text-base text-text-body/80 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}