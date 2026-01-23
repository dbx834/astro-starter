import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * CountryInput — ShadCN + Formik
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: field name (default: 'country')
 *  - id: html id (defaults to name)
 *  - label: boolean|string (true -> "Country", string -> custom, false -> no label)
 *  - placeholder: boolean|string (true -> "Country", string -> custom, false -> '')
 *  - required: boolean
 *  - className: container classes
 */
export default function CountryInput({
  form,
  name = 'country',
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
    label === true ? 'Country' : typeof label === 'string' ? label : null

  const placeholderText =
    placeholder === true
      ? 'Country'
      : typeof placeholder === 'string'
      ? placeholder
      : ''

  return (
    <div className={['mb-4', className].join(' ')}>
      {labelText && (
        <Label htmlFor={fieldId} className="country">
          {labelText}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Input
        id={fieldId}
        type="text"
        autoComplete="country-name"
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
