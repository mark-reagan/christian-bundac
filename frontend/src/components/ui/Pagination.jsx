export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page: current, last_page: last } = meta

  return (
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
      <p className="text-sm text-slate-500">
        Page {current} of {last} &middot; {meta.total} total
      </p>
      <div className="flex gap-2">
        <button
          className="btn-secondary btn-sm"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          Previous
        </button>
        <button
          className="btn-secondary btn-sm"
          disabled={current >= last}
          onClick={() => onPageChange(current + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
