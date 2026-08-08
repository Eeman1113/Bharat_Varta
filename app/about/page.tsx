import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Masthead compact />
      <div className="asterism" aria-hidden="true" />
      <main className="mx-auto max-w-3xl px-6">
        <h2 className="title-caps mb-12">About</h2>
        <div className="prose-paper justify">
          <p>
            Your Paper is a small, slow journal. It appears roughly every
            fortnight, and only when there is something to say. The subjects
            are what its editor happens to be thinking about — usually some
            corner of mathematics, some corner of music, and, when the wind is
            right, both at once.
          </p>
          <p>
            It is written in the belief that the internet is still large enough
            to contain a few quiet rooms, and that quietness is not the same as
            silence.
          </p>
          <p>
            There is no advertising here, no tracking, and no algorithm. If you
            would like to receive future issues, you may{" "}
            <a href="/subscribe">subscribe by post</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
