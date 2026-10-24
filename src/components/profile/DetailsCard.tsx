// Read-only details. On the owner's page, Edit swaps this card for the form.

import { textButtonClass } from "@/components/profile/ui";

export type DetailRow = { label: string; value: string };

export function DetailsCard({
  title,
  rows,
  editing,
  canEdit,
  editLabel,
  onEdit,
  contact,
  children,
}: {
  title: string;
  rows: DetailRow[];
  editing: boolean;
  canEdit: boolean;
  editLabel: string;
  onEdit: () => void;
  contact?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="card space-y-3" aria-labelledby="details-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="details-heading" className="text-xl font-bold">
          {title}
        </h2>
        {canEdit && !editing ? (
          <button type="button" onClick={onEdit} className={textButtonClass}>
            {editLabel}
          </button>
        ) : null}
      </div>
      {editing ? (
        children
      ) : (
        <>
          <dl className="space-y-3">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-sm font-semibold text-stone-500">{row.label}</dt>
                <dd className="whitespace-pre-wrap text-base">{row.value}</dd>
              </div>
            ))}
          </dl>
          {contact}
        </>
      )}
    </section>
  );
}
