import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  hideOnMobile?: boolean;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="card p-10 text-center text-sm text-forest-400">{emptyMessage}</div>
    );
  }

  return (
    <>
      <div className="card hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-forest-100 bg-forest-50/60">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 font-semibold text-forest-700">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle text-forest-700">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="card space-y-2 p-4">
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-forest-400">{col.header}</span>
                  <span className="text-right text-forest-700">{col.render(row)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
