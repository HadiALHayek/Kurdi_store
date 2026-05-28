import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBuilderStore } from '../../store/builderStore'
import { useBuildCodesStore } from '../../store/buildCodesStore'
import { useProductsStore } from '../../store/productsStore'
import { decodeBuildFromParam } from '../../utils/buildShare'

export function BuildHydrator() {
  const [searchParams] = useSearchParams()
  const products = useProductsStore((s) => s.products)
  const loadBuild = useBuilderStore((s) => s.loadBuild)
  const resolveParam = useBuildCodesStore((s) => s.resolveParam)

  useEffect(() => {
    const fromQuery = searchParams.get('build')
    const shortCode = searchParams.get('code')
    const fromCode = shortCode ? resolveParam(shortCode) : null
    const encoded = fromQuery || fromCode
    if (!encoded) return
    const decoded = decodeBuildFromParam(encoded, products)
    if (Object.keys(decoded).length > 0) {
      loadBuild(decoded)
    }
  }, [searchParams, products, loadBuild, resolveParam])

  return null
}
