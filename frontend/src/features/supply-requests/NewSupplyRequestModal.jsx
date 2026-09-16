import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { supplyRequestsApi } from './api'

const EMPTY = { quantity: 1, purpose: '' }

export default function NewSupplyRequestModal({ open, onClose, supply, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setError(null)
    }
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await supplyRequestsApi.create({
        supply_id: supply.id,
        quantity: Number(form.quantity),
        purpose: form.purpose,
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
    <Modal open={open} onClose={onClose} title={`Request Supply — ${supply?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">
          {supply?.stock_quantity} {supply?.unit} currently in stock.
        </p>
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          min="1"
          max={supply?.stock_quantity}
          required
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <Textarea
          label="Purpose"
          name="purpose"
          required
          placeholder="What is this supply needed for?"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
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
