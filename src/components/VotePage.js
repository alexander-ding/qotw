import React from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Button, ButtonGroup } from 'react-bootstrap'
import { withFirebase } from 'react-redux-firebase'
import Quote from './DisplayQuote'
import SplashScreen from './SplashScreen'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}


const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
});

const orderData = (data, userEmail) => {
  if (!data.voters.includes(userEmail)) {
    console.log("Returning as is")
    return data
  }
  const votes = data.quotes.map(quote => 
    quote.votes.filter(({email}) => email === userEmail)[0].vote
  )
  
  let quotes = [].fill(0, 0, votes.length)
  votes.forEach((vote, index) => {
    quotes[vote] = data.quotes[index]
  })

  
  return Object.assign(data, {quotes: quotes})
}

class VotePage extends React.Component {
  constructor(props) {
    super(props)
    this.firebase = props.firebase
    this.state = {
      isLoaded: false,
      data: null,
      prevData: null,
      isInEditMode: false,
      isPristine: true,
    }
    this.onDragEnd = this.onDragEnd.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.loadData = this.loadData.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  componentDidMount() {
    this.loadData()
  }

  loadData() {
    const getQuotes = this.firebase.functions().httpsCallable('getQuotes')

    getQuotes({status: "pending"}).then((result) => {
      const userEmail = this.firebase.auth().currentUser.email
      
      const data = {
        ...result.data,
        quotes: result.data.quotes.filter(quote => quote.nominated)
      }

      this.setState({
        isLoaded: true,
        data: orderData(data, userEmail),
        isInEditMode: !result.data.voters.includes(userEmail),
        isPristine: !result.data.voters.includes(userEmail),
      })
    })
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const quotes = reorder(
      this.state.data.quotes,
      result.source.index,
      result.destination.index
    )

    this.setState({
      data: Object.assign(this.state.data, {
        quotes: quotes
      })
    })
  }

  handleSubmit() {
    const votes = this.state.data.quotes.map(quote => quote.id)
    const publicationID = this.state.data.id
    if (this.state.isPristine) {
      const vote = this.firebase.functions().httpsCallable('vote');
      vote({votes, publicationID}).then(
        this.setState({
          isPristine: false,
          isInEditMode: false,
        })
      ).catch(console.error)
    } else {
      const changeVote = this.firebase.functions().httpsCallable('changeVote');
      changeVote({votes, publicationID}).then(
        this.setState({
          isInEditMode: false,
        })
      ).catch(console.error)
    }
  }

  handleEdit() {
    this.setState({
      prevData: {...this.state.data},
      isInEditMode: true,
    })
  }

  handleCancel() {
    this.setState({
      data: {...this.state.prevData},
      isInEditMode: false,
    })
  }

  render() {
    if (!this.state.isLoaded) {
      return <SplashScreen/>
    }
    return (
      <div className="main">
        <h1>Voting Time!</h1>
        
        <DragDropContext onDragEnd={this.onDragEnd}>
        
          <Droppable droppableId="droppable" style={{padding: 0}}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
            {this.state.isInEditMode ?
          <ButtonGroup>
            <Button variant="success" onClick={this.handleSubmit}>Save</Button>
            {this.state.isPristine ? 
              null :
              <Button variant="danger" onClick={this.handleCancel}>Cancel</Button>
            }
          </ButtonGroup> :
          <ButtonGroup><Button onClick={this.handleEdit}>Edit</Button></ButtonGroup>
        }
        <br/>
        <small>Drag and drop to reorder the quotes, from your favorite to least.</small>
              {this.state.data.quotes.map((quote, index) => (
                <Draggable key={quote.id} draggableId={quote.id} index={index} isDragDisabled={!this.state.isInEditMode}>
                  {(provided, snapshot) => (
                  <div ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}>
                    <Quote quote={quote.quote.quote} people={quote.quote.people} id={quote.id}/>
                  </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }
  
}

export default withFirebase(VotePage)