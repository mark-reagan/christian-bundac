import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { EQUIPMENT_CONDITIONS } from '../../lib/constants'
import { releaseReturnApi } from './api'

export default function ReturnEquipmentModal({ open, onClose, equipmentRequest, transactionId, onSaved }) {
  const [form, setForm] = useState({ condition_on_return: 'good', remarks: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await releaseReturnApi.returnEquipment(transactionId, form)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Confirm Return — ${equipmentRequest?.equipment?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Condition on return"
          value={form.condition_on_return}
          onChange={(e) => setForm({ ...form, condition_on_return: e.target.value })}
        >
          {EQUIPMENT_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </Select>
        <Textarea
          label="Remarks (optional)"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          placeholder="Any notes about the condition or return…"
        />

        <ErrorAlert error={error} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Confirm return
          </Button>
        </div>
      </form>
    </Modal>
  )
}
