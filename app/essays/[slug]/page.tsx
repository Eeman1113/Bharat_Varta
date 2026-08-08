import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { getPost, posts } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

// Split into { firstWord, rest } so we can style the opening word in caps
// like the reference's "ALBERT Einstein is …" treatment.
function splitFirstWord(text: string): { firstWord: string; rest: string } {
  const match = text.match(/^(\p{L}+)([\s\S]*)$/u);
  if (!match) return { firstWord: text, rest: "" };
  return { firstWord: match[1], rest: match[2] };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const [firstPara, ...restParas] = post.body;
  const { firstWord, rest } = splitFirstWord(firstPara);

  return (
    <div className="page-post">
      <header>
        <h2>
          <Link href="/" rel="history">
            {post.title}
          </Link>
        </h2>
      </header>

      <main>
        <hr className="rule" />
        <article>
          <p>
            <span className="first-word">{firstWord}</span>
            {rest}
          </p>
          {restParas.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
        <hr className="rule" />

        <footer>0031220130,0021120230</footer>
      </main>
    </div>
  );
}
