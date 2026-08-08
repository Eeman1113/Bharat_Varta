import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Subscribe to Bharat Varta — receive future issues of India's daily wire by post.",
  alternates: { canonical: "/subscribe" },
  openGraph: {
    title: "Subscribe · Bharat Varta",
    description:
      "Subscribe to Bharat Varta — receive future issues of India's daily wire by post.",
    url: "/subscribe",
    type: "website",
  },
};

export default function SubscribePage() {
  return (
    <>
      <Masthead compact />
      <div className="asterism" aria-hidden="true" />
      <main className="mx-auto max-w-xl px-6">
        <h2 className="title-caps mb-8">Subscribe</h2>
        <p className="prose-paper text-center mb-10">
          Leave a return address. New issues arrive by email — no more than one
          every other week, and nothing else.
        </p>
        <form className="flex flex-col sm:flex-row items-stretch gap-3 border-y border-rule py-6">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            type="email"
            required
            placeholder="your@address.example"
            className="flex-1 bg-transparent border-b border-rule focus:border-ink outline-none py-2 px-1 font-serif text-lg placeholder:text-muted/70"
          />
          <button
            type="submit"
            className="smcaps text-sm border border-ink px-5 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            Post it to me
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
