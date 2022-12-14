import 'src/styles/pages/search.scss'

import { parseSearchState, SearchProvider } from '@faststore/sdk'
import { graphql } from 'gatsby'
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import { useEffect, useState } from 'react'
import Breadcrumb from 'src/components/sections/Breadcrumb'
import ProductGallery from 'src/components/sections/ProductGallery'
import SROnly from 'src/components/ui/SROnly'
import { ITEMS_PER_PAGE } from 'src/constants'
import { applySearchState } from 'src/sdk/search/state'
import { useSession } from 'src/sdk/session'
import { mark } from 'src/sdk/tests/mark'
import type { SearchState } from '@faststore/sdk'
import type { PageProps } from 'gatsby'
import type {
  SearchPageQueryQuery,
  SearchPageQueryQueryVariables,
} from '@generated/graphql'

export type Props = PageProps<
  SearchPageQueryQuery,
  SearchPageQueryQueryVariables
>

const useSearchParams = ({ href }: Location) => {
  const [params, setParams] = useState<SearchState | null>(null)

  useEffect(() => {
    const url = new URL(href)

    setParams(parseSearchState(url))
  }, [href])

  return params
}

function Page(props: Props) {
  const {
    data: { site },
  } = props

  const { locale } = useSession()
  const searchParams = useSearchParams(props.location)
  const title = 'Search Results | BaseStore'

  if (!searchParams) {
    return null
  }

  return (
    <SearchProvider
      onChange={applySearchState}
      itemsPerPage={ITEMS_PER_PAGE}
      {...searchParams}
    >
      {/* SEO */}
      <GatsbySeo
        noindex
        language={locale}
        title={title}
        description={site?.siteMetadata?.description ?? ''}
        titleTemplate={site?.siteMetadata?.titleTemplate ?? ''}
        openGraph={{
          type: 'website',
          title,
          description: site?.siteMetadata?.description ?? '',
        }}
      />

      <SROnly as="h1" text={title} />

      {/*
        WARNING: Do not import or render components from any
        other folder than '../components/sections' in here.

        This is necessary to keep the integration with the CMS
        easy and consistent, enabling the change and reorder
        of elements on this page.

        If needed, wrap your component in a <Section /> component
        (not the HTML tag) before rendering it here.
      */}
      <Breadcrumb name="All Products" />

      <ProductGallery
        title="Search Results"
        searchTerm={searchParams.term ?? undefined}
      />
    </SearchProvider>
  )
}

export const querySSG = graphql`
  query SearchPageQuery {
    site {
      siteMetadata {
        titleTemplate
        title
        description
      }
    }
  }
`

Page.displayName = 'Page'

export default mark(Page)
