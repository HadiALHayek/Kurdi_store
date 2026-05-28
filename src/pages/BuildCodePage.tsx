import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useBuilderStore } from '../store/builderStore'
import { useBuildCodesStore } from '../store/buildCodesStore'
import { useProductsStore } from '../store/productsStore'
import { decodeBuildFromParam } from '../utils/buildShare'

export function BuildCodePage() {
  const { code } = useParams<{ code: string }>()
  const products = useProductsStore((s) => s.products)
  const resolveParam = useBuildCodesStore((s) => s.resolveParam)
  const loadBuild = useBuilderStore((s) => s.loadBuild)

  useEffect(() => {
    if (!code) return
    const param = resolveParam(code)
    if (!param) return
    const decoded = decodeBuildFromParam(param, products)
    if (Object.keys(decoded).length > 0) loadBuild(decoded)
  }, [code, products, resolveParam, loadBuild])

  if (!code) return <Navigate to="/builder" replace />
  return <Navigate to="/builder" replace />
}
