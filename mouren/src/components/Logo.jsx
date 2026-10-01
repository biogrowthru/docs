import { LOGO_PATH } from './logoPath.js'

export function Logo({ className = '', vertical = false, title = 'mouren' }) {
  if (vertical) {
    return (
      <svg viewBox="0 0 150 1030" className={className} role="img" aria-label={title} fill="currentColor">
        <path fillRule="evenodd" d={LOGO_PATH} transform="translate(0 1030) rotate(-90)" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 1030 150" className={className} role="img" aria-label={title} fill="currentColor">
      <path fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  )
}
