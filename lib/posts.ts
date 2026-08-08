export type Post = {
  slug: string;
  title: string;
  titleGlyph?: string;
  date: string;
  reading: string;
  excerpt: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "counterpoint-and-proof",
    title: "Counterpoint and Proof",
    titleGlyph: "Çøµñtërpøîñt ∆ñd Prøøf",
    date: "August 2, 2026",
    reading: "9 min",
    excerpt:
      "On the strange kinship between Bach's two-part inventions and the sober elegance of a mathematical proof — how both are architectures made of consequence…",
    body: [
      "There is a suspicion, familiar to anyone who has ever traced a fugue with a pencil, that the pleasure we take in Bach is not so different from the pleasure of a proof. Both begin with a small parcel of material — a subject, an axiom — and both spend themselves in following that material where it leads.",
      "A theorem is not a list of facts. It is a route. The steps do not merely arrive at the conclusion; they earn it. In the same way, a two-part invention does not so much end as complete a shape one has been half-seeing since the first bar.",
      "What we call beauty, in either case, is the quiet astonishment of inevitability. It could not have gone otherwise, and yet, before it happened, no one thought of it.",
    ],
  },
  {
    slug: "on-the-mercy-of-approximation",
    title: "On the Mercy of Approximation",
    titleGlyph: "Øñ †hë Mërçy øf Ãpprøxîmãtîøñ",
    date: "July 18, 2026",
    reading: "6 min",
    excerpt:
      "Why we tune our instruments a little wrong — the equal-tempered scale, the ε-δ definition, and the small lies that make large truths possible…",
    body: [
      "The equal-tempered scale is a compromise so useful we have almost forgotten it is a compromise. No fifth is quite a fifth; no third is quite a third; and yet every key is playable, and modulation — that great nineteenth-century invention — becomes a room one may walk through instead of a door one must break down.",
      "Analysis begins with a similar mercy. We admit that we cannot say what a limit is, only what happens near it, and this admission turns out to be enough.",
    ],
  },
  {
    slug: "gausss-childhood-sum",
    title: "Gauss's Childhood Sum, Reconsidered",
    titleGlyph: "G∆µ∫∫'∫ Çhîldhøød Sµm",
    date: "July 3, 2026",
    reading: "5 min",
    excerpt:
      "Everyone has heard the anecdote. Fewer have asked what the young Gauss actually noticed — and what it teaches about the shape of attention…",
    body: [
      "The story is told so often that it has calcified. A schoolmaster, a punishment, a boy who returned an answer before the others had begun. What is usually missed is what Gauss was doing while the rest were adding: not adding.",
      "He was looking. He arranged the numbers into pairs — first and last, second and second-to-last — and saw that each pair had the same sum. The problem dissolved because he refused to solve it in the order presented.",
    ],
  },
  {
    slug: "the-quiet-of-the-well-tempered",
    title: "The Quiet of the Well-Tempered",
    titleGlyph: "†hë Qµîët øf †hë Wëll-†ëmpërëd",
    date: "June 21, 2026",
    reading: "7 min",
    excerpt:
      "A slow reading of the C-major prelude — the one that seems to be about nothing at all, and is therefore, perhaps, about everything…",
    body: [
      "The prelude begins as if it had already been going on for some time and we had only just walked into the room. There is no announcement, no thesis. A chord unfolds, and unfolds again, and continues.",
    ],
  },
  {
    slug: "notes-on-the-margins",
    title: "Notes on the Margins",
    titleGlyph: "Nøtë∫ øñ †hë M∆rgîñ∫",
    date: "June 5, 2026",
    reading: "3 min",
    excerpt:
      "A miscellany. On Fermat's famous margin, on the letters between Euler and Goldbach, and on why the best ideas are so often the ones you almost didn't write down…",
    body: [
      "Fermat's margin has become a joke, but it is also a shrine. The claim it did not have room for has cost three centuries of work and produced, along the way, most of modern algebraic geometry.",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
