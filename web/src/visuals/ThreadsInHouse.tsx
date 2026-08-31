import { Diagram } from "./Diagram";
import { MONO } from "./svg";

export function ThreadsInHouse() {
  return (
    <Diagram caption="Two threads · one house · one whiteboard">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full"
        role="img"
        aria-label="Two threads inside one process sharing a counter"
      >
        <rect
          x="24"
          y="20"
          width="392"
          height="188"
          rx="8"
          fill="#161512"
          stroke="#2a2824"
        />
        <text x="40" y="44" fill="#9a9286" fontFamily={MONO} fontSize="11">
          process address space
        </text>
        <rect
          x="172"
          y="64"
          width="96"
          height="56"
          rx="5"
          fill="#1b1a17"
          stroke="#d4785b"
        />
        <text
          x="220"
          y="84"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="10"
        >
          HEAP
        </text>
        <text
          x="220"
          y="106"
          textAnchor="middle"
          fill="#d4785b"
          fontFamily={MONO}
          fontSize="16"
        >
          1
        </text>

        <g>
          <circle cx="88" cy="148" r="16" fill="#8aa4c9" />
          <text
            x="88"
            y="153"
            textAnchor="middle"
            fill="#12110f"
            fontFamily={MONO}
            fontSize="10"
          >
            T1
          </text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 36 -10; 16 16; 0 0"
            dur="5s"
            repeatCount="indefinite"
          />
        </g>
        <g>
          <circle cx="352" cy="148" r="16" fill="#7fa98a" />
          <text
            x="352"
            y="153"
            textAnchor="middle"
            fill="#12110f"
            fontFamily={MONO}
            fontSize="10"
          >
            T2
          </text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -32 12; -10 -14; 0 0"
            dur="5.4s"
            repeatCount="indefinite"
          />
        </g>
        <text
          x="88"
          y="192"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="10"
        >
          own stack
        </text>
        <text
          x="352"
          y="192"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="10"
        >
          own stack
        </text>
        <text
          x="220"
          y="226"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="11"
        >
          both can touch counter++ · lost update
        </text>
      </svg>
    </Diagram>
  );
}
