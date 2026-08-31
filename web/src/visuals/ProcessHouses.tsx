import { Diagram } from "./Diagram";
import { MONO } from "./svg";

export function ProcessHouses() {
  return (
    <Diagram caption="Two processes · private address spaces">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full"
        role="img"
        aria-label="Two process houses; a crash in one does not enter the other"
      >
        <path
          d="M48 100 L120 48 L192 100"
          fill="none"
          stroke="#d4785b"
          strokeWidth="1.6"
        />
        <rect
          x="60"
          y="100"
          width="120"
          height="100"
          fill="#161512"
          stroke="#d4785b"
          strokeWidth="1.3"
        />
        <rect
          x="104"
          y="148"
          width="32"
          height="52"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <text
          x="120"
          y="88"
          textAnchor="middle"
          fill="#d4785b"
          fontFamily={MONO}
          fontSize="11"
        >
          PID 412
        </text>
        <g>
          <rect
            x="76"
            y="116"
            width="88"
            height="22"
            rx="3"
            fill="#d4785b"
            opacity="0.45"
          />
          <text
            x="120"
            y="131"
            textAnchor="middle"
            fill="#ebe4d6"
            fontFamily={MONO}
            fontSize="11"
          >
            crash
          </text>
          <animate
            attributeName="opacity"
            values="1;0.15;1"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </g>

        <path
          d="M248 100 L320 48 L392 100"
          fill="none"
          stroke="#7fa98a"
          strokeWidth="1.6"
        />
        <rect
          x="260"
          y="100"
          width="120"
          height="100"
          fill="#161512"
          stroke="#7fa98a"
          strokeWidth="1.3"
        />
        <rect
          x="304"
          y="148"
          width="32"
          height="52"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <text
          x="320"
          y="88"
          textAnchor="middle"
          fill="#7fa98a"
          fontFamily={MONO}
          fontSize="11"
        >
          PID 413
        </text>
        <circle cx="300" cy="132" r="5" fill="#7fa98a" />
        <text x="314" y="136" fill="#c8bfb2" fontFamily={MONO} fontSize="11">
          still running
        </text>

        <path d="M180 160 H260" stroke="#2a2824" strokeDasharray="5 5" />
        <text
          x="220"
          y="152"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="10"
        >
          no shared rooms
        </text>
      </svg>
    </Diagram>
  );
}
