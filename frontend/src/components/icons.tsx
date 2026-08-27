/**
 * Inline stroke icons, so the app stays dependency-free. All of them inherit
 * `currentColor` and size from the `size` prop (default 18).
 */
import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

function Icon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="4.5" rx="1.5" />
      <rect x="13.5" y="10.5" width="7.5" height="10.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </Icon>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15.5 20v-1.5a3.5 3.5 0 0 0-3.5-3.5H6a3.5 3.5 0 0 0-3.5 3.5V20" />
      <circle cx="9" cy="8" r="3.5" />
      <path d="M21.5 20v-1.5a3.5 3.5 0 0 0-2.75-3.42" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
    </Icon>
  )
}

export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21" />
      <path d="M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21" />
      <path d="M2.5 21h19" />
      <path d="M7 8h4M7 12h4M7 16h4M17 14h0M17 17.5h0" />
    </Icon>
  )
}

export function BadgeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2.25" />
      <path d="M5 16.2a4 4 0 0 1 7 0" />
      <path d="M15.5 10h3.5M15.5 13.5h3.5" />
    </Icon>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M9 15.5l2 2 3.5-4" />
    </Icon>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="2.75" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.6 1.6 0 0 0-2.72 1.14V21a1.9 1.9 0 1 1-3.8 0v-.1A1.6 1.6 0 0 0 7.7 19.5l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.06-.06A1.6 1.6 0 0 0 3 15H3a1.9 1.9 0 1 1 0-3.8h.1A1.6 1.6 0 0 0 4.5 8.5l-.06-.05a1.9 1.9 0 1 1 2.7-2.7l.06.06A1.6 1.6 0 0 0 9 6.05h.06A1.6 1.6 0 0 0 10.1 4.6V4.5a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 2.72 1.13l.05-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.06a1.6 1.6 0 0 0 1.14 2.72h.1a1.9 1.9 0 1 1 0 3.8h-.1a1.6 1.6 0 0 0-1.45.95z" />
    </Icon>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </Icon>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2.2 6.5-2.2 6.5h16.4S18 13.5 18 8.5" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </Icon>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
    </Icon>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Icon>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.3 3.9 2.5 17.3A2 2 0 0 0 4.2 20.3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0" />
      <path d="M12 9v4M12 16.5h0" />
    </Icon>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}
