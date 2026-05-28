import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCompareStore } from '../../store/compareStore'

export function CompareHydrator() {
  const [searchParams] = useSearchParams()
  const setIds = useCompareStore((s) => s.setIds)

  useEffect(() => {
    const raw = searchParams.get('compare')
    if (!raw) return
    const ids = raw.split(',').filter(Boolean).slice(0, 3)
    if (ids.length) setIds(ids)
  }, [searchParams, setIds])

  return null
}
