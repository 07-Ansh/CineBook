import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl bg-white border border-neutral-200/60 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Header */}
        <div className="space-y-3 text-center border-b border-neutral-100 pb-6">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
            Data Protection
          </span>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 mt-2">Privacy Policy</h1>
          <p className="text-xs font-bold text-neutral-400">Last Updated: July 2026</p>
        </div>

        {/* Portfolio Showcase Notice */}
        <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-2xl p-5 text-xs text-indigo-900 font-semibold leading-relaxed flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.87l-.497.828-.318.53a.75.75 0 01-1.255-.827l.38-.632zM15.75 15.75h.008v.008H15.75v-.008zM12 18a6 6 0 100-12 6 6 0 000 12z" />
          </svg>
          <div>
            <span className="font-extrabold uppercase tracking-wide block mb-0.5 text-indigo-950">Portfolio Showcase Notice</span>
            CineBook is a personal project built to demonstrate advanced full-stack engineering skills — covering responsive frontend design, RESTful backend APIs, relational database architecture, and live payment & booking transaction flows via Razorpay.
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-neutral-600 font-medium">
          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">1</span>
              Information Collection
            </h2>
            <p className="pl-8">
              At CineBook, we value your privacy. We collect minimal personal information (such as your name, email address, and profile photo) solely through authenticated Google Sign-in to process your cinema ticket bookings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">2</span>
              How We Use Data
            </h2>
            <p className="pl-8">
              Your information is used to link reservations to your profile, generate booking history, and authorize admin dashboard access where applicable. As a personal full-stack portfolio project by{' '}
              <a
                href="https://ansh.one"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors"
              >
                Ansh Sharma
              </a>{', '}
              this data is handled solely to demonstrate real-world authentication, database design, and transactional booking flows — not for commercial use.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">3</span>
              Data Sharing & Third Parties
            </h2>
            <p className="pl-8">
              We do not sell or trade your data. Authentication is processed securely via <strong>Firebase Auth</strong>, and payments are handled through <strong>Razorpay</strong> — a PCI-DSS compliant payment gateway. CineBook does not store raw card or payment credentials; all sensitive transaction data is managed directly by Razorpay. Database records are hosted privately and never shared commercially. View developer updates at{' '}
              <a
                href="https://github.com/07-Ansh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors"
              >
                Ansh Sharma on GitHub
              </a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">4</span>
              Security
            </h2>
            <p className="pl-8">
              We implement industry-standard encryption protocols and secure database connections to protect client info. Development and maintenance are managed exclusively by{' '}
              <a
                href="https://ansh.one"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors"
              >
                Ansh Sharma
              </a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">5</span>
              Contact & Privacy Requests
            </h2>
            <p className="pl-8">
              If you wish to request data erasure or have questions about our data handling, reach out via the official website portal at{' '}
              <a
                href="https://ansh.one"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors"
              >
                ansh.one
              </a>.
            </p>
          </section>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
          <Link
            to="/"
            className="px-5 py-2.5 border border-neutral-200 hover:border-neutral-300 rounded-full text-xs font-bold transition-all hover:bg-neutral-50 active:scale-95 cursor-pointer"
          >
            &larr; Home
          </Link>
          <Link
            to="/terms"
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Terms & Conditions &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
