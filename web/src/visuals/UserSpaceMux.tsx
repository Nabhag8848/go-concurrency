import { Diagram } from "./Diagram";
import { MONO } from "./svg";

export function UserSpaceMux() {
  return (
    <Diagram caption="Many goroutines · few OS threads · hop without the kernel">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full"
        role="img"
        aria-label="Goroutines multiplexed onto a small pool of OS threads"
      >
        <text x="16" y="28" fill="#9a9286" fontFamily={MONO} fontSize="11">
          G · goroutines
        </text>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={32 + i * 32}
            cy="56"
            r="9"
            fill="#c8bfb2"
            opacity={0.35 + (i % 3) * 0.18}
          />
        ))}
        <circle cx="32" cy="56" r="9" fill="#d4785b">
          <animate
            attributeName="cx"
            values="32;32;76;188;188"
            dur="5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="56;126;126;126;56"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>

        <text x="16" y="108" fill="#9a9286" fontFamily={MONO} fontSize="11">
          M · OS threads the kernel can see
        </text>
        <rect
          x="16"
          y="118"
          width="128"
          height="32"
          rx="5"
          fill="#161512"
          stroke="#8aa4c9"
        />
        <text
          x="80"
          y="139"
          textAnchor="middle"
          fill="#8aa4c9"
          fontFamily={MONO}
          fontSize="12"
        >
          M0
        </text>
        <rect
          x="160"
          y="118"
          width="128"
          height="32"
          rx="5"
          fill="#161512"
          stroke="#8aa4c9"
        />
        <text
          x="224"
          y="139"
          textAnchor="middle"
          fill="#8aa4c9"
          fontFamily={MONO}
          fontSize="12"
        >
          M1
        </text>

        <text x="16" y="188" fill="#9a9286" fontFamily={MONO} fontSize="11">
          park on a channel → another G runs on the same M
        </text>
        <text x="16" y="212" fill="#9a9286" fontFamily={MONO} fontSize="11">
          100k Gs can live · 100k Ms cannot
        </text>
      </svg>
    </Diagram>
  );
}
