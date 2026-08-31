import { Diagram } from "./Diagram";
import { MONO } from "./svg";

export function ContextSwitch() {
  return (
    <Diagram caption="Save A · trip through the kernel · load B">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full"
        role="img"
        aria-label="Context switch copying registers from thread A to thread B"
      >
        <text x="56" y="32" fill="#8aa4c9" fontFamily={MONO} fontSize="12">
          thread A
        </text>
        <text x="196" y="32" fill="#9a9286" fontFamily={MONO} fontSize="12">
          kernel
        </text>
        <text x="336" y="32" fill="#7fa98a" fontFamily={MONO} fontSize="12">
          thread B
        </text>
        {["PC", "R1", "SP"].map((label, i) => {
          const y = 56 + i * 42;
          return (
            <g key={label}>
              <text
                x="16"
                y={y + 16}
                fill="#9a9286"
                fontFamily={MONO}
                fontSize="11"
              >
                {label}
              </text>
              <rect
                x="48"
                y={y}
                width="72"
                height="26"
                rx="4"
                fill="#1b1a17"
                stroke="#8aa4c9"
              />
              <rect
                x="184"
                y={y}
                width="72"
                height="26"
                rx="4"
                fill="#1b1a17"
                stroke="#2a2824"
              />
              <rect
                x="320"
                y={y}
                width="72"
                height="26"
                rx="4"
                fill="#1b1a17"
                stroke="#7fa98a"
              />
              <rect
                x="54"
                y={y + 5}
                width="22"
                height="16"
                rx="2"
                fill="#d4785b"
              >
                <animate
                  attributeName="x"
                  values="54;190;326;326"
                  dur="3.2s"
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="1;1;1;0.25"
                  dur="3.2s"
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          );
        })}
        <text
          x="220"
          y="220"
          textAnchor="middle"
          fill="#9a9286"
          fontFamily={MONO}
          fontSize="11"
        >
          not free · cache and TLB go cold
        </text>
      </svg>
    </Diagram>
  );
}
