import { Diagram } from "./Diagram";
import { MONO } from "./svg";

export function ConcurrentVsParallel() {
  return (
    <Diagram caption="Concurrent · one core taking turns · parallel · two cores at once">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full"
        role="img"
        aria-label="Concurrency on one core versus parallelism on two cores"
      >
        <text x="16" y="28" fill="#9a9286" fontFamily={MONO} fontSize="11">
          concurrent · 1 core
        </text>
        <rect
          x="16"
          y="40"
          width="408"
          height="28"
          rx="4"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <rect
          x="22"
          y="46"
          width="192"
          height="16"
          rx="2"
          fill="#8aa4c9"
          opacity="0.35"
        />
        <rect
          x="226"
          y="46"
          width="192"
          height="16"
          rx="2"
          fill="#7fa98a"
          opacity="0.35"
        />
        <rect x="22" y="46" width="192" height="16" rx="2" fill="#8aa4c9">
          <animate
            attributeName="opacity"
            values="1;1;0.25;0.25;1"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="226" y="46" width="192" height="16" rx="2" fill="#7fa98a">
          <animate
            attributeName="opacity"
            values="0.25;0.25;1;1;0.25"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </rect>
        <text x="110" y="88" fill="#8aa4c9" fontFamily={MONO} fontSize="11">
          A
        </text>
        <text x="314" y="88" fill="#7fa98a" fontFamily={MONO} fontSize="11">
          B
        </text>

        <text x="16" y="124" fill="#9a9286" fontFamily={MONO} fontSize="11">
          parallel · 2 cores
        </text>
        <rect
          x="16"
          y="136"
          width="408"
          height="22"
          rx="4"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <rect x="22" y="141" width="396" height="12" rx="2" fill="#8aa4c9" />
        <rect
          x="16"
          y="168"
          width="408"
          height="22"
          rx="4"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <rect x="22" y="173" width="396" height="12" rx="2" fill="#7fa98a" />
        <text x="16" y="218" fill="#9a9286" fontFamily={MONO} fontSize="11">
          GOMAXPROCS caps Go code at the same instant
        </text>
      </svg>
    </Diagram>
  );
}
