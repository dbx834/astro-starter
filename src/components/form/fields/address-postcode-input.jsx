import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * AddressPostcode — ShadCN + Formik
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: field name (default: 'addressPostcode')
 *  - id: html id (defaults to name)
 *  - label: boolean|string (true -> "Postcode", string -> custom, false -> no label)
 *  - placeholder: boolean|string (true -> "Postcode", string -> custom, false -> '')
 *  - required: boolean
 *  - className: container classes
 *  - pattern: optional regex string for postcode format (leave blank for generic)
 */
export default function AddressPostcode({
  form,
  name = 'addressPostcode',
  id,
  label = true,
  placeholder = false,
  required = false,
  className = '',
  pattern, // optional
}) {
  const apply = form.getFieldProps
  const fieldId = id || name

  const touched = form.touched?.[name]
  const error = form.errors?.[name]
  const showError = Boolean(touched && error)
  const describedBy = showError ? `${fieldId}-error` : undefined

  const labelText =
    label === true ? 'Postcode' : typeof label === 'string' ? label : null

  const placeholderText =
    placeholder === true
      ? 'Postcode'
      : typeof placeholder === 'string'
      ? placeholder
      : ''

  return (
    <div className={['mb-4', className].join(' ')}>
      {labelText && (
        <Label htmlFor={fieldId} className="address-postcode">
          {labelText}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Input
        id={fieldId}
        type="text"
        inputMode="text"
        autoComplete="postal-code"
        placeholder={placeholderText}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={describedBy}
        required={required}
        className={
          showError ? 'border-destructive focus-visible:ring-destructive' : ''
        }
        pattern={pattern}
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
