import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

/**
 * PasswordInput1 — ShadCN + Formik (signup password)
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: field name (default: 'password1')
 *  - id: html id (defaults to name)
 *  - label: boolean|string (true -> "Password", string -> custom, false -> no label)
 *  - placeholder: boolean|string (true -> "Password", string -> custom, false -> '')
 *  - required: boolean
 *  - showToggle: boolean (default true) — show eye/eye-off toggle
 *  - className: container classes
 */
export default function PasswordInput1({
  form,
  name = 'password1',
  id,
  label = true,
  placeholder = false,
  required = false,
  showToggle = true,
  className = '',
}) {
  const apply = form.getFieldProps
  const fieldId = id || name

  const touched = form.touched?.[name]
  const error = form.errors?.[name]
  const showError = Boolean(touched && error)
  const describedBy = showError ? `${fieldId}-error` : undefined

  const [revealed, setRevealed] = useState(false)

  const labelText =
    label === true ? 'Password' : typeof label === 'string' ? label : null

  const placeholderText =
    placeholder === true
      ? 'Password'
      : typeof placeholder === 'string'
      ? placeholder
      : ''

  return (
    <div className={['mb-4', className].join(' ')}>
      {labelText && (
        <Label htmlFor={fieldId} className="password">
          {labelText}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id={fieldId}
          type={revealed ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={placeholderText}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={describedBy}
          required={required}
          className={
            showError
              ? 'border-destructive focus-visible:ring-destructive pr-10'
              : 'pr-10'
          }
          {...apply(name)}
        />

        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setRevealed((v) => !v)}
            className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {showError ? (
        <p id={`${fieldId}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
