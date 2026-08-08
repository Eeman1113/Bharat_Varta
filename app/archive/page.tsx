import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { posts } from "@/lib/posts";

export default function ArchivePage() {
  return (
    <>
      <Masthead compact />
      <div className="asterism" aria-hidden="true" />
      <main className="mx-auto max-w-2xl px-6">
        <h2 className="title-caps mb-12">Calendar</h2>
        <ul className="space-y-6">
          {posts.map((p) => (
            <li key={p.slug} className="flex items-baseline gap-6">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted w-36 shrink-0">
                {p.date}
              </span>
              <Link
                href={`/essays/${p.slug}`}
                className="font-serif text-xl hover:italic"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
