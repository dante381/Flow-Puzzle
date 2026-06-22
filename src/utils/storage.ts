import { STORAGE_VERSION } from '../constants/config'

export function loadJSON<T>(
  key: string,
  fallback: T,
  validate?: (v: Record<string, unknown>) => boolean,
): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed['schemaVersion'] !== STORAGE_VERSION) return fallback
    if (validate && !validate(parsed)) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded — game still works, just won't persist this write
  }
}
