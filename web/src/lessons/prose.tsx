import type { ReactNode } from "react";

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-3.5 font-normal last:mb-0">{children}</p>;
}

export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-sm bg-well px-1 py-0.5 font-mono text-[0.82em] text-ember">
      {children}
    </code>
  );
}

export function Ul({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  );
}

export function Li({ children }: { children: ReactNode }) {
  return <li className="pl-0.5">{children}</li>;
}

export function NoteTable({
  headers,
  rows,
}: {
  headers: ReactNode[];
  rows: ReactNode[][];
}) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.95rem]">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border-b border-rule pr-4 pb-1.5 font-medium text-paper"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-1.5 pr-4 align-top text-mute">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
