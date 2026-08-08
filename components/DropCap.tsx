// Illuminated-manuscript style initial cap.
// A decorative frame of interlaced foliage + a serif letter on top.
export default function DropCap({ letter }: { letter: string }) {
  const id = `ornleaf-${letter}`;
  return (
    <svg
      className="dropcap-figure"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Illuminated initial ${letter}`}
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          {/* interlaced vine motif */}
          <path
            d="M0 5 Q2.5 0 5 5 T10 5"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="0.7"
          />
          <path
            d="M0 5 Q2.5 10 5 5 T10 5"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="0.7"
          />
          <circle cx="2.5" cy="2.5" r="0.6" fill="#1a1a1a" />
          <circle cx="7.5" cy="7.5" r="0.6" fill="#1a1a1a" />
        </pattern>
      </defs>

      {/* outer square rule */}
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.2"
      />
      {/* filled pattern band */}
      <rect
        x="4.5"
        y="4.5"
        width="91"
        height="91"
        fill={`url(#${id})`}
        stroke="#1a1a1a"
        strokeWidth="0.6"
      />
      {/* inner clearing */}
      <rect
        x="14"
        y="14"
        width="72"
        height="72"
        fill="#eeece7"
        stroke="#1a1a1a"
        strokeWidth="0.8"
      />
      {/* corner florets */}
      {[
        [10, 10],
        [90, 10],
        [10, 90],
        [90, 90],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="2.2" fill="#eeece7" stroke="#1a1a1a" strokeWidth="0.7" />
          <circle cx={cx} cy={cy} r="0.9" fill="#1a1a1a" />
        </g>
      ))}
      {/* the initial letter */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily='"Libre Caslon Text", "Adobe Caslon Pro", Caslon, "EB Garamond", Georgia, serif'
        fontSize="58"
        fontWeight="500"
        fill="#1a1a1a"
      >
        {letter}
      </text>
    </svg>
  );
}
