import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { equipmentApi } from './api'

export default function QrViewModal({ open, onClose, equipment }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !equipment) return
    setLoading(true)
    setError(null)
    equipmentApi
      .qrCode(equipment.id)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [open, equipment])

  return (
    <Modal open={open} onClose={onClose} title={`QR Code — ${equipment?.name || ''}`} size="sm">
      {loading && <Spinner />}
      <ErrorAlert error={error} />
      {data && (
        <div className="flex flex-col items-center gap-3">
          <img
            src={data.qr_image_base64}
            alt={`QR code for equipment asset ${data.asset_code}`}
            className="h-56 w-56 rounded-lg ring-1 ring-slate-200"
          />
          <p className="text-sm font-medium text-slate-700">{data.asset_code}</p>
          <p className="break-all text-center text-xs text-slate-400">{data.qr_code}</p>
          <a
            href={data.qr_image_base64}
            download={`${data.asset_code}-qrcode.png`}
            className="btn-secondary btn-sm"
          >
            Download PNG
          </a>
        </div>
      )}
    </Modal>
  )
}
