import { Diagram } from "./Diagram";
import { MONO } from "./svg";

export function SchedulerStates() {
  return (
    <Diagram caption="Only running uses a core">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full"
        role="img"
        aria-label="Thread states: running, runnable, blocked"
      >
        <rect
          x="16"
          y="36"
          width="128"
          height="164"
          rx="10"
          fill="#161512"
          stroke="#d4785b"
        />
        <text
          x="80"
          y="64"
          textAnchor="middle"
          fill="#d4785b"
          fontFamily={MONO}
          fontSize="11"
        >
          RUNNING
        </text>
        <circle cx="80" cy="118" r="20" fill="#d4785b">
          <animate
            attributeName="opacity"
            values="1;0.45;1"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="80"
          y="176"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="11"
        >
          on a core
        </text>

        <rect
          x="156"
          y="36"
          width="128"
          height="164"
          rx="10"
          fill="#161512"
          stroke="#2a2824"
        />
        <text
          x="220"
          y="64"
          textAnchor="middle"
          fill="#c8bfb2"
          fontFamily={MONO}
          fontSize="11"
        >
          RUNNABLE
        </text>
        <circle cx="200" cy="108" r="11" fill="#8aa4c9" />
        <circle cx="240" cy="108" r="11" fill="#8aa4c9" opacity="0.65" />
        <circle cx="220" cy="140" r="11" fill="#8aa4c9" opacity="0.4" />
        <text
          x="220"
          y="176"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="11"
        >
          waiting in line
        </text>

        <rect
          x="296"
          y="36"
          width="128"
          height="164"
          rx="10"
          fill="#161512"
          stroke="#2a2824"
        />
        <text
          x="360"
          y="64"
          textAnchor="middle"
          fill="#c8bfb2"
          fontFamily={MONO}
          fontSize="11"
        >
          BLOCKED
        </text>
        <circle cx="360" cy="118" r="20" fill="#7fa98a">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="360"
          y="176"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="11"
        >
          parked · I/O
        </text>
      </svg>
    </Diagram>
  );
}
