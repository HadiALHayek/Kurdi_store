import type { Category, Product } from '../types'
import { getNumericSpecMax } from './productSpecs'

export interface WattageSegment {
  key: 'cpu' | 'gpu' | 'overhead' | 'headroom'
  labelKey: 'wattCpu' | 'wattGpu' | 'wattOverhead' | 'wattHeadroom'
  watts: number
  color: string
}

export function getWattageBreakdown(build: Partial<Record<Category, Product>>, psuWatts: number) {
  const cpu = getNumericSpecMax(build.CPU?.specs ?? {}, 'tdp')
  const gpu = getNumericSpecMax(build.GPU?.specs ?? {}, 'tdp')
  const overhead = 100
  const required = cpu + gpu + overhead
  const headroom = Math.max(0, psuWatts - required)

  const segments: WattageSegment[] = [
    { key: 'cpu', labelKey: 'wattCpu', watts: cpu, color: '#863bff' },
    { key: 'gpu', labelKey: 'wattGpu', watts: gpu, color: '#47bfff' },
    { key: 'overhead', labelKey: 'wattOverhead', watts: overhead, color: '#7e14ff' },
  ]
  if (psuWatts > 0 && headroom > 0) {
    segments.push({ key: 'headroom', labelKey: 'wattHeadroom', watts: headroom, color: '#22c55e' })
  }

  return { segments, required, psuWatts, headroom }
}
