export const metadata = {
  title: 'Privacy Policy - WatchKey',
  description: 'WatchKey privacy policy and data handling practices.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Last updated: May 2026
          </p>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-600 mb-4">
              WatchKey is committed to protecting your privacy. This Privacy Policy explains how we collect,
              use, and safeguard your information when you use our video analysis service.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly to us, including YouTube URLs you submit for analysis.
              We do not collect personal information unless explicitly provided.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to provide and improve our video analysis services,
              generate AI-powered summaries, chapters, and transcripts.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
