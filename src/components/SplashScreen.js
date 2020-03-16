import React from 'react'
import { Spinner } from 'react-bootstrap'
import "./SplashScreen.css"

const SplashScreen = () => (
  <div className="main">
    <div className="splash-screen">
      <Spinner animation="border" />
    </div>
  </div>
)

export default SplashScreen
