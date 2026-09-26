import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { equipmentRequestsApi } from './api'

const EMPTY = { quantity: 1, purpose: '', start_date: '', end_date: '' }

export default function NewEquipmentRequestModal(props) {
  if (!props.open) return null
  return <NewEquipmentRequestModalContent key={props.equipment?.id} {...props} />
}

function NewEquipmentRequestModalContent({ open, onClose, equipment, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await equipmentRequestsApi.create({
        equipment_id: equipment.id,
        quantity: Number(form.quantity),
        purpose: form.purpose,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Request Equipment — ${equipment?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">
          {equipment?.available_quantity} of {equipment?.total_quantity} unit(s) currently available.
        </p>
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          min="1"
          max={equipment?.available_quantity}
          required
          value={form.quantity}
          onChange={(e) => update('quantity', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start date"
            name="start_date"
            type="date"
            required
            value={form.start_date}
            onChange={(e) => update('start_date', e.target.value)}
          />
          <Input
            label="End date"
            name="end_date"
            type="date"
            required
            value={form.end_date}
            onChange={(e) => update('end_date', e.target.value)}
          />
        </div>
        <Textarea
          label="Purpose"
          name="purpose"
          required
          placeholder="What is this equipment needed for?"
          value={form.purpose}
          onChange={(e) => update('purpose', e.target.value)}
        />

        <ErrorAlert error={error} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit request
          </Button>
        </div>
      </form>
    </Modal>
  )
}
