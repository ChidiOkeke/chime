import React, { useMemo, useState } from 'react'

function normalizePhone(input) {
  // Keep digits only. Backend expects digits in text.
  const digits = String(input).replace(/\D/g, '')
  return digits
}

function isLikelyValidPhone(phone) {
  const d = normalizePhone(phone)
  return d.length >= 10 && d.length <= 15
}

export default function RSVPForm({ disabled, onSubmit }) {
  const [salutation, setSalutation] = useState('Mr')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    return !disabled && name.trim().length >= 2 && isLikelyValidPhone(phone)
  }, [disabled, name, phone])

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        setError('')

        const trimmedName = name.trim()
        const normalizedPhone = normalizePhone(phone)

        if (!trimmedName) return
        if (!isLikelyValidPhone(phone)) {
          setError('Enter a valid phone number (digits only).')
          return
        }

        await onSubmit({
          salutation,
          name: trimmedName,
          phone: normalizedPhone,
        })
      }}
    >
      <div className="grid">
        <label className="field">
          <span className="field__label">Salutation</span>
          <select
            className="field__input"
            value={salutation}
            onChange={(e) => setSalutation(e.target.value)}
            disabled={disabled}
          >
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Guest Name</span>
          <input
            className="field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jordan Smith"
            disabled={disabled}
          />
        </label>

        <label className="field">
          <span className="field__label">Phone</span>
          <input
            className="field__input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., (555) 123-4567"
            inputMode="tel"
            disabled={disabled}
          />
        </label>
      </div>

      {error && <div className="form__error">{error}</div>}

      <button className="btn btn--primary" type="submit" disabled={!canSubmit}>
        Get Access Card
      </button>

      <div className="form__fineprint">
        Duplicate RSVPs are prevented by phone number.
      </div>
    </form>
  )
}

