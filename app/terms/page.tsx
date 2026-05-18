export const metadata = {
  title: 'Terms of Service - WatchKey',
  description: 'WatchKey terms of service and usage guidelines.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Last updated: May 2026
          </p>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using WatchKey, you accept and agree to be bound by the terms
              and provisions of this agreement.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Use of Service</h2>
            <p className="text-gray-600 mb-4">
              WatchKey provides AI-powered video analysis services. You agree to use the service
              only for lawful purposes and in accordance with these Terms.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Content</h2>
            <p className="text-gray-600 mb-4">
              You are responsible for ensuring you have the right to analyze any videos submitted
              through our service. WatchKey does not claim ownership of your content.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
