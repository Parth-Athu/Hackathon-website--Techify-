import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import tribalArt from '@/assets/tribal-banner.jpg'; // update to your real path

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <section className="flex flex-col md:flex-row items-center gap-10 mb-12">
          <img
            src={tribalArt}
            alt="Tribal art illustration"
            className="w-full md:w-2/5 rounded-lg shadow-xl border-4 border-orange-200"
          />
          <div>
            <h1 className="text-4xl font-extrabold mb-4 text-amber-900 ">
              देसी <span className="text-orange-600">  Roots</span> — Our Mission
            </h1>
            <p className="text-lg text-gray-800 max-w-xl leading-relaxed">
              Tribal art represents some of the most profound and authentic expressions of human creativity. Yet, it remains{' '}
              <span className="italic text-red-700">
                undervalued, insufficiently documented, and often excluded from mainstream markets
              </span>
              . Our vision is to preserve this vibrant heritage and uplift the communities that nurture it.
            </p>
          </div>
        </section>

        <section className="bg-orange-50 rounded-xl p-8 shadow-lg mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-orange-700">What We Do</h2>
          <ul className="list-disc ml-6 text-lg text-gray-700 space-y-3">
            <li>
              <strong>Preserve & Document —</strong> Systematically record tribal art traditions, techniques, and narratives for future generations.
            </li>
            <li>
              <strong>Promote Recognition —</strong> Reposition tribal art as fine art, deserving of visibility and respect worldwide.
            </li>
            <li>
              <strong>Facilitate Market Access —</strong> Create equitable opportunities for tribal artists to connect directly with patrons and audiences.
            </li>
            <li>
              <strong>Empower Communities —</strong> Ensure fair compensation, visibility, and dignity for artists and their families.
            </li>
          </ul>
        </section>

        <section className="max-w-3xl mx-auto text-center">
          <p className="text-xl text-slate-700 leading-relaxed">
            We believe tribal art is not merely craft, but an enduring form of cultural identity and intangible heritage.
            Through research, advocacy, and collaboration, we aim to{' '}
            <span className="font-semibold">
              elevate tribal art to its rightful place in the global cultural landscape
            </span>{' '}
            while ensuring artists' voices remain at the heart of our mission.
          </p>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
