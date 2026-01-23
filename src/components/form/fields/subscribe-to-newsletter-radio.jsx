import React from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/**
 * SubscribeToNewsletter — ShadCN + Formik
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: field name (default: 'subscribeToNewsletter')
 *  - label: string (group label, default: 'Subscribe to newsletter?')
 *  - disabled: boolean
 *  - asBoolean: boolean (default: true) — true => stores boolean, false => stores 'Yes'/'No'
 *  - className: container classes
 */
export default function SubscribeToNewsletter({
  form,
  name = 'subscribeToNewsletter',
  label = 'Subscribe to newsletter?',
  disabled = false,
  asBoolean = true,
  className = '',
}) {
  const touched = form.touched?.[name]
  const error = form.errors?.[name]
  const hasError = Boolean(touched && error)

  const idYes = `${name}-yes`
  const idNo = `${name}-no`

  // Derive radio value from current form value
  const raw = form.values?.[name]
  const radioValue =
    raw === true || raw === 'Yes'
      ? 'yes'
      : raw === false || raw === 'No'
      ? 'no'
      : ''

  const onChange = (val) => {
    const next = asBoolean ? val === 'yes' : val === 'yes' ? 'Yes' : 'No'
    form.setFieldValue(name, next)
  }

  return (
    <div className={['mb-4', className].join(' ')}>
      <p className="group-label text-sm font-medium">{label}</p>

      <RadioGroup
        value={radioValue}
        onValueChange={onChange}
        className="flex gap-6"
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${name}-error` : undefined}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem id={idYes} value="yes" disabled={disabled} />
          <Label htmlFor={idYes}>Yes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem id={idNo} value="no" disabled={disabled} />
          <Label htmlFor={idNo}>No</Label>
        </div>
      </RadioGroup>

      {hasError ? (
        <p id={`${name}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
