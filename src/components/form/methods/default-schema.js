import * as Yup from 'yup'
import YupPassword from 'yup-password'
YupPassword(Yup)

/** ---------- Helpers ---------- */

// Trim strings; turn "" -> undefined so .notRequired() behaves as expected
const trimAndUndef = (val) => {
  if (typeof val !== 'string') return val
  const t = val.trim()
  return t === '' ? undefined : t
}

// Build a required string with common defaults
const requiredString = (msg) =>
  Yup.string().transform(trimAndUndef).required(msg)

// Build an optional string (trimmed, empty -> undefined)
const optionalString = () =>
  Yup.string().transform(trimAndUndef).nullable().notRequired()

// Label helper for nicer messages (Formik can use .label in error formatting)
const withLabel = (schema, label) => schema.label(label)

/** ---------- Primitives ---------- */

// Name
export const name = withLabel(requiredString('Please enter your name'), 'Name')

// Email (lowercase + trimmed)
export const email = withLabel(
  Yup.string()
    .transform((v) => {
      const t = trimAndUndef(v)
      return typeof t === 'string' ? t.toLowerCase() : t
    })
    .required('Please enter your email')
    .email('Should be a valid email'),
  'Email'
)

// Password (simple: required only)
export const password = withLabel(
  Yup.string().transform(trimAndUndef).required('Please enter password'),
  'Password'
)

// Password (strong rules, using yup-password)
export const password1 = withLabel(
  Yup.string()
    .transform(trimAndUndef)
    .required('Please enter password')
    .min(
      6,
      'Password must contain 6 or more characters with at least one of each: uppercase, lowercase and number.'
    )
    .minLowercase(1, 'Password must contain at least 1 lower case letter')
    .minUppercase(1, 'Password must contain at least 1 upper case letter')
    .minNumbers(1, 'Password must contain at least 1 number'),
  'Password'
)

// Confirm password (matches password1)
export const password2 = withLabel(
  Yup.string()
    .transform(trimAndUndef)
    .required('Please repeat password')
    .oneOf([Yup.ref('password1')], 'Passwords do not match.'),
  'Confirm password'
)

// Subscription type
export const subscriptionType = withLabel(
  Yup.string().transform(trimAndUndef).required('Please choose an option'),
  'Subscription type'
)

// Optional text fields
export const address = withLabel(
  optionalString().max(1000, 'Address is too long'),
  'Address'
)
export const country = withLabel(
  Yup.string().transform(trimAndUndef).required('Please enter your country'),
  'Country'
)
export const comment = withLabel(
  optionalString().max(2000, 'Comment is too long'),
  'Comment'
)
export const requiredComment = withLabel(
  requiredString('Please enter your comment').max(2000, 'Comment is too long'),
  'Comment'
)

// Newsletter: make it a boolean (checkbox friendly)
export const subscribeToNewsletter = Yup.boolean()
  .default(false)
  .label('Subscribe to newsletter')

// Address parts (all optional, trimmed)
export const addressStreet1 = withLabel(optionalString().max(255), 'Street 1')
export const addressStreet2 = withLabel(optionalString().max(255), 'Street 2')
export const addressLandmark = withLabel(optionalString().max(255), 'Landmark')
export const addressState = withLabel(
  optionalString().max(120),
  'State/Province'
)
export const addressCountry = withLabel(optionalString().max(120), 'Country')

// Basic, portable postcode pattern (letters/digits/space/-), tweak per locale as needed
export const addressPostcode = withLabel(
  optionalString().matches(
    /^[A-Za-z0-9 \-]{3,12}$/,
    'Please enter a valid postal code'
  ),
  'Postal code'
)

/** ---------- Reusable object schemas (optional) ---------- */

// Minimal login schema
export const LoginSchema = Yup.object({
  email,
  password,
})

// Strong-signup schema (password1/2)
export const SignupSchema = Yup.object({
  name,
  email,
  password1,
  password2,
  subscribeToNewsletter,
})

// Address schema (optional fields)
export const AddressSchema = Yup.object({
  address,
  addressStreet1,
  addressStreet2,
  addressLandmark,
  addressState,
  addressCountry,
  addressPostcode,
  country, // if you want a required country alongside detailed parts
})

/** ---------- Formik tip ---------- */
// When validating: `validateOnBlur: true, validateOnChange: false` + `abortEarly: false`
// to show all errors at once:
//
// <Formik validationSchema={LoginSchema} validateOnChange={false} validateOnBlur abortEarly={false} />
