import { Diagram } from "./Diagram";
import { MONO } from "./svg";

export function BlockVsSpin() {
  return (
    <Diagram caption="Spin occupies the core · block frees it">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full"
        role="img"
        aria-label="A spinning thread wasting a core versus a blocked thread leaving the core free"
      >
        <rect
          x="16"
          y="20"
          width="196"
          height="196"
          rx="10"
          fill="#161512"
          stroke="#2a2824"
        />
        <text
          x="114"
          y="48"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="11"
        >
          busy-wait
        </text>
        <circle
          cx="114"
          cy="112"
          r="32"
          fill="none"
          stroke="#2a2824"
          strokeWidth="7"
        />
        <g>
          <circle
            cx="114"
            cy="112"
            r="32"
            fill="none"
            stroke="#d4785b"
            strokeWidth="7"
            strokeDasharray="28 174"
            strokeLinecap="round"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 114 112"
            to="360 114 112"
            dur="1.15s"
            repeatCount="indefinite"
          />
        </g>
        <text
          x="114"
          y="188"
          textAnchor="middle"
          fill="#d4785b"
          fontFamily={MONO}
          fontSize="11"
        >
          core occupied
        </text>

        <rect
          x="228"
          y="20"
          width="196"
          height="196"
          rx="10"
          fill="#161512"
          stroke="#2a2824"
        />
        <text
          x="326"
          y="48"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="11"
        >
          block
        </text>
        <rect
          x="256"
          y="78"
          width="140"
          height="30"
          rx="4"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <text
          x="326"
          y="98"
          textAnchor="middle"
          fill="#7fa98a"
          fontFamily={MONO}
          fontSize="11"
        >
          parked · asleep
        </text>
        <rect x="248" y="128" width="44" height="16" rx="3" fill="#8aa4c9">
          <animate
            attributeName="x"
            values="248;258;300;318"
            dur="3.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="3.6s"
            repeatCount="indefinite"
          />
        </rect>
        <text
          x="326"
          y="188"
          textAnchor="middle"
          fill="#7fa98a"
          fontFamily={MONO}
          fontSize="11"
        >
          core free · packet wakes
        </text>
      </svg>
    </Diagram>
  );
}
