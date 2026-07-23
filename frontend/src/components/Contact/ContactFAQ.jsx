import { useState } from 'react';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';

const defaultFaqs = [
  {
    id: 1,
    question: 'What are the admission requirements?',
    answer: 'Students must have basic Quran reading skills. No formal degree is required. An entrance assessment helps us place you in the right level.',
  },
  {
    id: 2,
    question: 'Are there classes for both male and female students?',
    answer: 'Yes, we offer separate classes for male and female students with qualified male and female teachers respectively.',
  },
  {
    id: 3,
    question: 'Can I study online from anywhere in the world?',
    answer: 'Absolutely! Our online platform allows students from all over the world to attend live classes and access recorded sessions.',
  },
];

function FAQItem({ faq, isOpen, onToggle, index }) {
  const f = faq || {};
  return (
    <ScrollReveal delay={index * 50}>
      <button
        onClick={onToggle}
        className="w-full bg-white rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 text-left group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-lg sm:text-lg text-text-dark group-hover:text-primary transition-colors">
              {f.question || ''}
            </h3>
          </div>
          <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'bg-primary text-white rotate-180' : 'text-primary'
          }`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Answer - Expands */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 mt-4' : 'max-h-0'
        }`}>
          <p className="text-text-body leading-relaxed text-sm sm:text-base pr-8">              {f.answer || ''}
          </p>
        </div>
      </button>
      </ScrollReveal>
  );
}

export default function ContactFAQ({ faqs }) {
  const [openFAQ, setOpenFAQ] = useState(0);
  const items = Array.isArray(faqs) && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-primary-light via-white to-accent-soft">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Questions?"
          title="Frequently Asked Questions"
          description="Find answers to common questions about our academy and programs."
        />

        <div className="mt-10 space-y-4">
          {items.map((faq, index) => (
            <FAQItem
              key={faq.id || index}
              faq={faq}
              index={index}
              isOpen={openFAQ === index}
              onToggle={() => setOpenFAQ(openFAQ === index ? -1 : index)}
            />
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-white rounded-3xl p-8 sm:p-10 text-center shadow-lg">
          <h3 className="font-heading font-bold text-2xl text-text-dark mb-4">
            Didn't find your answer?
          </h3>
          <p className="text-text-body mb-6">
            Feel free to contact our support team directly. We're here to help!
          </p>
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Contact Support
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
