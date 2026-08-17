import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl bg-white border border-neutral-200/60 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Header */}
        <div className="space-y-3 text-center border-b border-neutral-100 pb-6">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
            Legal Agreement
          </span>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 mt-2">Terms & Conditions</h1>
          <p className="text-xs font-bold text-neutral-400">Last Updated: July 2026</p>
        </div>

        {/* Portfolio Showcase Notice */}
        <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-2xl p-5 text-xs text-indigo-900 font-semibold leading-relaxed flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.87l-.497.828-.318.53a.75.75 0 01-1.255-.827l.38-.632zM15.75 15.75h.008v.008H15.75v-.008zM12 18a6 6 0 100-12 6 6 0 000 12z" />
          </svg>
          <div>
            <span className="font-extrabold uppercase tracking-wide block mb-0.5 text-indigo-950">Portfolio Showcase Notice</span>
            CineBook is a personal showcase project built to demonstrate advanced full-stack development skills, including clean frontend design, modular RESTful APIs, optimized database schema design, and live ACID transaction implementations for booking seats — with real payment processing via Razorpay.
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-neutral-600 font-medium">
          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">1</span>
              Agreement to Terms
            </h2>
            <p className="pl-8">
              Welcome to <strong>CineBook</strong>, owned and operated by{' '}
              <a
                href="https://ansh.one"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors"
              >
                Ansh Sharma
              </a>. By accessing or using our booking service, you agree to comply with and be bound by these Terms & Conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">2</span>
              Description of Service & Showcase Purpose
            </h2>
            <p className="pl-8">
              CineBook provides a seamless interface for browsing weekly movie releases, scheduling shows, and reserving seating layouts. This platform is part of a premium full-stack portfolio project developed in a clean, professional manner to demonstrate engineering capabilities in responsive layout design, robust backend controllers, database schema design, and complex transactional payment/booking states. Explore the codebase under{' '}
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
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">3</span>
              Ticket Booking, Payments & Reservation
            </h2>
            <div className="pl-8">
              <ul className="list-disc space-y-1.5">
                <li>All reservations are subject to ticket availability and local show scheduling.</li>
                <li>Users are expected to provide valid identification matching reservation names upon request.</li>
                <li>Seat selection layouts are updated in real-time to avoid double-bookings.</li>
                <li>
                  Payments are processed securely through <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway. By completing a payment, you agree to Razorpay&apos;s Terms of Service. CineBook does not store raw card details or payment credentials.
                </li>
                <li>All booking charges are final. Refunds, where applicable, are subject to show cancellation policies.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">4</span>
              Intellectual Property
            </h2>
            <p className="pl-8">
              All original assets, design tokens, logos, and custom codebases contained within this app are the intellectual property of{' '}
              <a
                href="https://ansh.one"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors"
              >
                Ansh Sharma
              </a>. Any redistribution of assets requires explicit permissions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-xs text-neutral-500 font-black">5</span>
              Contact Information
            </h2>
            <p className="pl-8">
              For any queries, developer partnerships, or issues related to these Terms, please contact{' '}
              <a
                href="https://ansh.one"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors"
              >
                Ansh Sharma
              </a>{' '}
              directly via the official portfolio at{' '}
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
            to="/privacy"
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
