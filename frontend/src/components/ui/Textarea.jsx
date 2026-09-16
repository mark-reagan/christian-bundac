export default function Textarea({ label, error, id, className = '', rows = 3, ...props }) {
  const inputId = id || props.name
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea id={inputId} rows={rows} className={`input ${error ? 'ring-red-400' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
