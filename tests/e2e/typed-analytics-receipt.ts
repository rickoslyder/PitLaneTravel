export type DecodedVendorEvent = {
  event: string
  properties: Record<string, unknown>
}

export type AppDefinedCustomPropertyReview = {
  event: string
  approvedCustomProperties: Record<string, unknown>
  unapprovedCustomKeys: string[]
  privacyScanMaterial: {
    event: string
    properties: Record<string, unknown>
  }
}

const APPROVED_APP_DEFINED_CUSTOM_KEYS: Record<string, readonly string[]> = {
  $pageview: ["schema_version", "route"],
  "hero calendar CTA clicked": ["schema_version"]
}

export function isPostHogTransportEnvelopeKey(key: string): boolean {
  return (
    key.startsWith("$") ||
    key === "token" ||
    key === "distinct_id" ||
    key === "title"
  )
}

export function appDefinedCustomPropertyReview(
  event: DecodedVendorEvent
): AppDefinedCustomPropertyReview {
  const allowed = new Set(APPROVED_APP_DEFINED_CUSTOM_KEYS[event.event] ?? [])
  const approvedCustomProperties: Record<string, unknown> = {}
  const unapprovedCustomKeys: string[] = []

  for (const key of Object.keys(event.properties)) {
    if (isPostHogTransportEnvelopeKey(key)) {
      continue
    }
    if (allowed.has(key)) {
      approvedCustomProperties[key] = event.properties[key]
    } else {
      unapprovedCustomKeys.push(key)
    }
  }

  return {
    event: event.event,
    approvedCustomProperties,
    unapprovedCustomKeys,
    privacyScanMaterial: {
      event: event.event,
      properties: { ...approvedCustomProperties }
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function eventFromUnknown(value: unknown): DecodedVendorEvent | null {
  const record = asRecord(value)
  if (typeof record?.event !== "string") {
    return null
  }
  return {
    event: record.event,
    properties: asRecord(record.properties) ?? {}
  }
}

function eventsFromUnknownList(values: unknown[]): DecodedVendorEvent[] {
  const events: DecodedVendorEvent[] = []
  for (const item of values) {
    const event = eventFromUnknown(item)
    if (event) {
      events.push(event)
    }
  }
  return events
}

export function vendorEventsFromPayload(payload: unknown): DecodedVendorEvent[] {
  if (Array.isArray(payload)) {
    return eventsFromUnknownList(payload)
  }

  const root = asRecord(payload)
  if (!root) {
    return []
  }

  const events: DecodedVendorEvent[] = []
  if (Array.isArray(root.batch)) {
    events.push(...eventsFromUnknownList(root.batch))
  }

  const rootEvent = eventFromUnknown(root)
  if (rootEvent) {
    events.push(rootEvent)
  }
  return events
}
