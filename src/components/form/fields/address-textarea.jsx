import React from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * AddressTextarea — ShadCN + Formik
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: field name (default: 'address')
 *  - id: html id (defaults to name)
 *  - label: boolean|string (true -> "Address", string -> custom, false -> no label)
 *  - placeholder: boolean|string (true -> "Address", string -> custom, false -> '')
 *  - required: boolean
 *  - rows: number (default 5)
 *  - className: container classes
 */
export default function AddressTextarea({
  form,
  name = 'address',
  id,
  label = true,
  placeholder = false,
  required = false,
  rows = 5,
  className = '',
}) {
  const apply = form.getFieldProps
  const fieldId = id || name

  const touched = form.touched?.[name]
  const error = form.errors?.[name]
  const showError = Boolean(touched && error)
  const describedBy = showError ? `${fieldId}-error` : undefined

  const labelText =
    label === true ? 'Address' : typeof label === 'string' ? label : null

  const placeholderText =
    placeholder === true
      ? 'Address'
      : typeof placeholder === 'string'
      ? placeholder
      : ''

  return (
    <div className={['mb-4', className].join(' ')}>
      {labelText && (
        <Label htmlFor={fieldId} className="address">
          {labelText}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Textarea
        id={fieldId}
        name={name}
        rows={rows}
        placeholder={placeholderText}
        autoComplete="street-address"
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
