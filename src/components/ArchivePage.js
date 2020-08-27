import algoliasearch from 'algoliasearch'
import 'firebase/functions'
import React from 'react'
import { InstantSearch, PoweredBy } from 'react-instantsearch-dom'
import InfiniteHits from './InfiniteHits'
import SearchBox from './SearchBox'

const ArchivePage = () => {
  const searchClient = algoliasearch('DLRD60KG2Y', '19c42c13cf8a5448a7f545ab8e80d2fe')

  return (
    <div className="main">
      <h3>Archive</h3> 
      <InstantSearch indexName="publications" searchClient={searchClient}>
        <SearchBox />
        <InfiniteHits minHitsPerPage={16} />
        <PoweredBy className="row justify-content-end margin-0"/>
      </InstantSearch>
    </div>
  )
}

export default ArchivePage