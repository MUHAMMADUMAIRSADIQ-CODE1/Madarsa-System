import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-soft via-white to-primary-light">
      <div className="text-center px-6">
        <div className="text-9xl font-heading font-bold text-primary/20 mb-4">404</div>
        <h1 className="font-heading text-4xl font-bold text-text-dark mb-4">
          Page Not Found
        </h1>
        <p className="text-text-body text-lg mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl shadow-lg hover:bg-primary-dark transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
