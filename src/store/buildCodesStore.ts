import { create } from 'zustand'
import type { BuildMap } from '../types'
import { encodeBuildToParam } from '../utils/buildShare'

const STORAGE_KEY = 'kurdi_build_codes_v1'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

interface CodeEntry {
  param: string
  updatedAt: number
}

const load = (): Record<string, CodeEntry> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, CodeEntry>) : {}
  } catch {
    return {}
  }
}

const persist = (map: Record<string, CodeEntry>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

const randomCode = (length = 6) => {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

interface BuildCodesState {
  codes: Record<string, CodeEntry>
  registerBuild: (build: BuildMap) => string
  resolveParam: (code: string) => string | null
}

export const useBuildCodesStore = create<BuildCodesState>((set, get) => ({
  codes: load(),
  registerBuild: (build) => {
    const param = encodeBuildToParam(build)
    if (!param) return ''
    let code = randomCode()
    const existing = get().codes
    while (existing[code] && existing[code].param !== param) {
      code = randomCode()
    }
    const next = { ...existing, [code]: { param, updatedAt: Date.now() } }
    const entries = Object.entries(next)
    const trimmed = Object.fromEntries(entries.slice(-200))
    persist(trimmed)
    set({ codes: trimmed })
    return code
  },
  resolveParam: (code) => {
    const entry = get().codes[code.toUpperCase()]
    return entry?.param ?? null
  },
}))

export function buildCodeShareUrl(code: string) {
  return `${window.location.origin}/build/${code.toUpperCase()}`
}
