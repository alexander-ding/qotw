import React from 'react'
import { NavDropdown } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { connect } from 'react-redux'
import { isEmpty, useFirebase } from 'react-redux-firebase'
import { Link, useHistory, withRouter } from 'react-router-dom'
import logo from "../images/logo.png"

const OurNavbar = ({location, auth, profile}) => {
  const firebase = useFirebase()
  const history = useHistory()
  function redirect(path) {
    history.push(path)
  }
  const isLoggedIn = !isEmpty(auth)
  return (
  <Navbar expand="sm" variant="dark" bg="dark" style={{position: 'sticky', top: 0, zIndex: 1000}}>
  <Navbar.Brand href="/">
    <img src={logo} alt="logo" width="30" height="30" className="d-inline-block align-top" style={{marginRight: '5px'}}/>
    QOTW
  </Navbar.Brand>
  <Navbar.Toggle aria-controls="navbar"/>
  <Navbar.Collapse id="navbar">
    <Nav className="mr-auto">
      <Nav.Item >
        <Nav.Link href="/" component={Link} active={location.pathname === "/"}>
          Home
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/Vote" component={Link} active={location.pathname === "/Vote"}>
          Vote
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/Archive" component={Link} active={location.pathname === "/Archive"}>
          Archive
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/About" style={{'paddingRight': '1rem'}} component={Link} active={location.pathname === "/About"}>
          About
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/Submit" style={{padding: 0, 'paddingLeft': '0rem'}} component={Link} active={location.pathname === "/Submit"}>
          <Button variant="outline-light">
            New Quote
          </Button>
        </Nav.Link>
      </Nav.Item>
    </Nav>
    <Nav className="ml-auto">
      {isLoggedIn ? 
        <NavDropdown title={auth.displayName}>
          <NavDropdown.Item onClick={() => redirect("/Profile")}>Profile</NavDropdown.Item>
          <NavDropdown.Item onClick={() => redirect("/History")}>History</NavDropdown.Item>
          <NavDropdown.Divider />
          { profile.isModerator ?
            <React.Fragment>
              <NavDropdown.Item onClick={() => redirect("/Console")}>Quotemaster</NavDropdown.Item>
              <NavDropdown.Divider/>
            </React.Fragment> :
            null
          }
          <NavDropdown.Item onClick={() => {
            firebase.logout()
            redirect("/")
          }}>Log Out</NavDropdown.Item>
        </NavDropdown> :
        <Nav.Item>
        <Nav.Link href="/Login" style={{padding: 0}} component={Link} active={location.pathname === "/Login"}>
          <Button variant="outline-light">
            Login
          </Button>
        </Nav.Link>
        </Nav.Item>
      }
    </Nav>
  </Navbar.Collapse>
  
  </Navbar>
)}


const enhance = connect(
  // Map redux state to component props
  ({ firebase: { auth, profile } }) => ({
    auth,
    profile
  })
)


export default enhance(withRouter(OurNavbar))