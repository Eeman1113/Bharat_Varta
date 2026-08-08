import Link from "next/link";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Masthead({ compact = false }: { compact?: boolean }) {
  const now = new Date();
  return (
    <header
      className={`np-masthead mx-auto max-w-[1400px] px-4 sm:px-6 text-center ${
        compact ? "pt-6 pb-3 sm:pt-8 sm:pb-4" : "pt-8 pb-5 sm:pt-14 sm:pb-6"
      }`}
    >
      <div className="np-masthead-meta flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-8 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.2em] text-ink/70">
        <span>India Edition</span>
        <span aria-hidden>·</span>
        <span>Established mmxxvi</span>
      </div>
      <Link href="/" className="inline-block">
        <h1
          className="wordmark text-ink mt-2 sm:mt-3"
          style={{
            fontSize: compact
              ? "clamp(2.4rem, 10vw, 3.6rem)"
              : "clamp(2.6rem, 13vw, 6.5rem)",
          }}
          aria-label="Your Paper"
        >
          {/* Alt multi-script wordmark — kept for easy revert:
              <span aria-hidden="true">भঅਰઅତ వഅರதꯑ</span>
          */}
          <span aria-hidden="true">Yøµr P∆per</span>
        </h1>
      </Link>
      <p className="np-masthead-date mt-2 sm:mt-3 font-mono text-[10px] sm:text-[12px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-ink/75 px-2 leading-relaxed">
        <span className="whitespace-nowrap">{formatDate(now)}</span>
        <span className="hidden sm:inline">
          {" "}
          &nbsp;·&nbsp; A daily paper, drawn from the wires of the subcontinent
        </span>
        <span className="sm:hidden block mt-1">
          Wires of the subcontinent
        </span>
      </p>
      <div className="np-masthead-rail mt-4 sm:mt-6 border-t border-b border-ink/40 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.24em] text-ink/70 overflow-hidden">
        <span className="np-rail-inner block">
          Politics · Markets · Sport · Culture · Opinion · Technology · Weather
        </span>
      </div>
    </header>
  );
}
