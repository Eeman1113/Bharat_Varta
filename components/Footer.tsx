export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 sm:pb-16 pt-8 sm:pt-10 text-center">
      <hr className="border-t border-ink/40 mx-auto max-w-[220px] sm:max-w-[280px] mb-4" />
      <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.24em] text-ink/60 leading-relaxed">
        © {new Date().getFullYear()} Your Paper
        <span className="hidden sm:inline"> &nbsp;·&nbsp; </span>
        <span className="sm:hidden"> · </span>
        No advertising, no algorithm
        <span className="hidden sm:inline"> &nbsp;·&nbsp; </span>
        <span className="sm:hidden"> · </span>
        By Eeman Majumder
      </p>
    </footer>
  );
}
