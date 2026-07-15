import { studentDashboardData } from '../../data/studentDashboardData';

export default function CertificatesSection() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">Your Certificates</h2>
        <a href="#" className="text-primary font-semibold text-sm hover:underline">View All</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(studentDashboardData.certificates || []).map((cert) => {
          const issueDate = new Date(cert.issueDate);
          
          return (
            <div
              key={cert.id}
              className="group relative rounded-xl overflow-hidden shadow-md border border-border-light hover:shadow-xl transition-all duration-300"
            >
              {/* Certificate Background */}
              <div className="h-48 bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-50 relative overflow-hidden">
                {/* Decorative Border */}
                <div className="absolute inset-3 border-2 border-yellow-300 rounded-lg" />
                <div className="absolute top-6 left-6 text-yellow-400 text-3xl opacity-30">⭐</div>
                <div className="absolute bottom-6 right-6 text-yellow-400 text-3xl opacity-30">⭐</div>
                
                {/* Certificate Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-yellow-700 font-semibold uppercase tracking-widest">Certificate of</p>
                  <p className="text-lg font-bold text-yellow-900 mt-2">{cert.title}</p>
                  <p className="text-xs text-yellow-700 mt-4">Completed</p>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-text-dark text-lg group-hover:text-primary transition-colors">
                  {cert.title}
                </h3>
                <p className="text-sm text-text-light mt-1">{cert.instructor}</p>
                <p className="text-xs text-text-light mt-2">Issued: {issueDate.toLocaleDateString()}</p>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 px-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm">
                    View
                  </button>
                  <button className="flex-1 py-2 px-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary-light transition-colors text-sm">
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!studentDashboardData.certificates || studentDashboardData.certificates.length === 0) && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-text-light mt-4">Complete courses to earn certificates</p>
        </div>
      )}
    </div>
  );
}
