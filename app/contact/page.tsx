import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Masthead compact />
      <div className="asterism" aria-hidden="true" />
      <main className="mx-auto max-w-xl px-6 text-center">
        <h2 className="title-caps mb-8">Correspondence</h2>
        <p className="prose-paper">
          Letters, corrections, and thoughtful disagreements are welcome at{" "}
          <a href="mailto:editor@yourpaper.example">
            editor@yourpaper.example
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
