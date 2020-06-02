class Vote {
  constructor(votes) { this.votes = [...votes]; this._votes = [...votes]; }
  currentVote() { return this.votes[0]; }
  exhausted() { return this.votes.length === 0; }
  reset() { this.votes = [...this._votes] }
  eliminate(i) { this.votes = this.votes.filter(v => (v !== i));}
}

// TODO: revisit voting code

const preferentialVoting = (votes, length, candidates) => {
  var round = 0
  while (round < length) {
    var currentVotes = Array.apply(null, Array(length)).map((_, index) => ({index, vote: 0}))
    for (let vote of votes) {
      if (!vote.exhausted()) {
        currentVotes[vote.currentVote()].vote += 1;
      }
    }
    var sumVotes = currentVotes.reduce((a, b) => (a+b.vote), 0)
    currentVotes.sort((a, b) => (b.vote-a.vote))
    if (sumVotes === 0) {
      return candidates[0]
    }
    if (currentVotes[0].vote > (sumVotes / 2)) {
      votes.forEach(vote => {
        vote.reset()
      })
      return currentVotes[0].index
    }
    const indexToEliminate = currentVotes[currentVotes.length-1].index
    votes.forEach(vote => {
      vote.eliminate(indexToEliminate)
    })
    round += 1
  }
  // then a tie, return any
  return candidates[0]
}

const reassembleVotes = (quotes, length) => {
  var reassembled = {}
  quotes.forEach((quote, index) => {
    quote.votes.forEach((vote) => {
      if (!reassembled.hasOwnProperty(vote.email)) {
        reassembled[vote.email] = Array.apply(null, Array(length)).map(() => null)
      }
      reassembled[vote.email][vote.vote] = index
    })
  })
  return Object.keys(reassembled).map((email) => reassembled[email].filter(v => (v !== null)))
}
export const rankQuotes = (quotes) => {
  if (quotes.length === 0) {
    return quotes
  }
  var votes = reassembleVotes(quotes, quotes.length)
  var ranking = []
  var candidates = Array.apply(null, Array(quotes.length)).map((_, i) => i)
  do {
    const votesForRound = votes.map(vote => new Vote(vote))
    const nextRank = preferentialVoting(votesForRound, quotes.length, candidates)
    ranking.push(nextRank)
    candidates = candidates.filter(v => (v !== nextRank))
    votes = votes.map(vote => vote.filter(v => (v !== nextRank)))
  } while (ranking.length < quotes.length)
  
  return ranking.map(rank => quotes[rank])
}

export const encodeFirebase = (str) => {
  if (str) return str.replace(/(?:\r\n|\r|\n)/g, "%n")
  return ""
}

export const decodeFirebase = (str) => {
  if (str) return str.replace(/%n/g, "\n")
  return ""
}