import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * AddressStreet1 — ShadCN + Formik
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: field name (default: 'addressStreet1')
 *  - id: html id (defaults to name)
 *  - label: boolean|string (true -> "Street Address 1", string -> custom, false -> no label)
 *  - placeholder: boolean|string (true -> "Street Address 1", string -> custom, false -> '')
 *  - required: boolean
 *  - className: container classes
 */
export default function AddressStreet1({
  form,
  name = 'addressStreet1',
  id,
  label = true,
  placeholder = false,
  required = false,
  className = '',
}) {
  const apply = form.getFieldProps
  const fieldId = id || name

  const touched = form.touched?.[name]
  const error = form.errors?.[name]
  const showError = Boolean(touched && error)
  const describedBy = showError ? `${fieldId}-error` : undefined

  const labelText =
    label === true
      ? 'Street Address 1'
      : typeof label === 'string'
      ? label
      : null

  const placeholderText =
    placeholder === true
      ? 'Street Address 1'
      : typeof placeholder === 'string'
      ? placeholder
      : ''

  return (
    <div className={['mb-4', className].join(' ')}>
      {labelText && (
        <Label htmlFor={fieldId} className="address-street-1">
          {labelText}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Input
        id={fieldId}
        type="text"
        autoComplete="address-line1"
        placeholder={placeholderText}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={describedBy}
        required={required}
        className={
          showError ? 'border-destructive focus-visible:ring-destructive' : ''
        }
        {...apply(name)}
      />

      {showError ? (
        <p id={`${fieldId}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
