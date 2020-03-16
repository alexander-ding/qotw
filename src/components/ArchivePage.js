import algoliasearch from 'algoliasearch'
import 'firebase/functions'
import React from 'react'
import { Configure, InstantSearch, PoweredBy } from 'react-instantsearch-dom'
import InfiniteHits from './InfiniteHits'
import SearchBox from './SearchBox'

const ArchivePage = () => {
  const searchClient = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID, process.env.REACT_APP_ALGOLIA_API_KEY)

  return (
    <div className="main">
      <h3>Archive</h3> 
      <InstantSearch indexName="publications" searchClient={searchClient}>
        <Configure hitsPerPage={16} />
        <SearchBox />
        <PoweredBy className="row justify-content-end margin-0"/>
        <InfiniteHits minHitsPerPage={16} />
        
      </InstantSearch>
    </div>
  )
}

export default ArchivePage