import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import { connectInfiniteHits } from 'react-instantsearch-dom';
import Hit from './Hit';

class InfiniteHits extends Component {
  onSentinelIntersection = entries => {
    const { hasMore, refineNext } = this.props;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        refineNext()
      }
    });
  };
  
  componentDidMount() {
    this.observer = new IntersectionObserver(this.onSentinelIntersection);

    this.observer.observe(this.sentinel);
  }

  componentWillUnmount() {
    this.observer.disconnect();
  }
  
  render() {
    const { hits } = this.props
    console.log(hits)
    return (
      <div className="ais-InfiniteHits">
        <ListGroup>
          {hits.map(hit => (
            <ListGroup.Item key={hit.objectID}>
              <Hit hit={hit} />
            </ListGroup.Item>
          ))}
          <div
            className="ais-InfiniteHits-sentinel"
            ref={c => (this.sentinel = c)}
          />
        </ListGroup>
      </div>
    );
  }
}

export default connectInfiniteHits(InfiniteHits)