import { Diagram } from "./Diagram";
import { MONO } from "./svg";

const ops = ["LOAD", "ADD", "STORE", "JMP"];

export function CoreFetch() {
  return (
    <Diagram caption="One core · one instruction at a time">
      <svg
        viewBox="0 0 440 240"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="A CPU core fetching and executing one instruction at a time"
      >
        <text x="16" y="22" fill="#9a9286" fontFamily={MONO} fontSize="11">
          instruction stream
        </text>
        {ops.map((op, i) => (
          <g key={op} transform={`translate(${16 + i * 72} 36)`}>
            <rect
              width="64"
              height="32"
              rx="4"
              fill="#1b1a17"
              stroke="#2a2824"
            />
            <text
              x="32"
              y="21"
              textAnchor="middle"
              fill="#c8bfb2"
              fontFamily={MONO}
              fontSize="11"
            >
              {op}
            </text>
          </g>
        ))}
        <rect
          x="14"
          y="34"
          width="68"
          height="36"
          rx="5"
          fill="none"
          stroke="#d4785b"
          strokeWidth="1.6"
        >
          <animate
            attributeName="x"
            values="14;86;158;230;14"
            dur="4.8s"
            calcMode="discrete"
            repeatCount="indefinite"
          />
        </rect>

        <rect
          x="16"
          y="96"
          width="408"
          height="128"
          rx="8"
          fill="#161512"
          stroke="#2a2824"
        />
        <text x="32" y="122" fill="#d4785b" fontFamily={MONO} fontSize="11">
          CORE 0
        </text>
        <text x="32" y="156" fill="#9a9286" fontFamily={MONO} fontSize="10">
          PC
        </text>
        <rect
          x="62"
          y="142"
          width="88"
          height="22"
          rx="2"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <text x="74" y="157" fill="#ebe4d6" fontFamily={MONO} fontSize="11">
          0x04A2
        </text>
        <text x="168" y="156" fill="#9a9286" fontFamily={MONO} fontSize="10">
          REGS
        </text>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={214 + i * 26}
            y="142"
            width="22"
            height="22"
            rx="2"
            fill="#1b1a17"
            stroke="#2a2824"
          />
        ))}
        <text x="32" y="196" fill="#9a9286" fontFamily={MONO} fontSize="10">
          SP
        </text>
        <rect
          x="62"
          y="182"
          width="88"
          height="22"
          rx="2"
          fill="#1b1a17"
          stroke="#2a2824"
        />
        <text x="74" y="197" fill="#8aa4c9" fontFamily={MONO} fontSize="11">
          0x7FF0
        </text>
        <text x="168" y="197" fill="#9a9286" fontFamily={MONO} fontSize="10">
          this bundle is a thread of execution
        </text>
      </svg>
    </Diagram>
  );
}
