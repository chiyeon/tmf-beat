import NavBar from "../../components/navbar/navbar.jsx"
import InputField from "../../components/InputField/inputfield.jsx"
import axios from "axios"
import { useState } from "react"

import "./secret.css"

const Secret = () => {

   const [secret, setSecret] = useState("")
   const [minutes, setMinutes] = useState(0.0)
   const [message, _setMessage] = useState("")
   const [showMessage, setShowMessage] = useState(false)
   const [messageInterval, setMessageInterval] = useState(null)

   const setMessage = (message) => {
      _setMessage(message)
      setShowMessage(true)

      if (messageInterval) clearTimeout(messageInterval)
      setMessageInterval(setTimeout(() => setShowMessage(false), 3000))
   }

   const start_vote = async () => {
      let response
      try {
         response = await axios({
            method: "post",
            url: process.env.REACT_APP_SERVER_URL + "/start",
            data: {
               secret: secret,
               minutes: minutes
            }
         })
         setMessage(response.data.message)
      } catch (e) {
         if (e.response.data.message) setMessage(e.response.data.message)
      }
   }

   const reset = async () => {
      let response
      try {
         response = await axios({
            method: "post",
            url: process.env.REACT_APP_SERVER_URL + "/reset",
            data: {
               secret: secret
            }
         })
         setMessage(response.data.message)
      } catch (e) {
         if (e.response.data.message) setMessage(e.response.data.message)
      }
   }

   return (
      <main className="secret">
         <div 
            className = {
               showMessage === false
               ? "notification tag hidden"
               : "notification tag"
            }
         >{message}</div>

         <span className="site-title">
            <h1>secret</h1>
            <h1>page</h1>
         </span>

         <NavBar />

         <center><p><i>That my Favorite!</i></p></center>

         <div className="admin-box">
            <InputField type="text" label="Vote Duration" onInput={e => setMinutes(parseFloat(e.target.value))} />
            <InputField type="password" label="Secret" onInput={e => setSecret(e.target.value)} />
            <button onClick={() => start_vote()} className="tag start-button">Start</button>
            <button onClick={() => reset()} className="tag start-button">Reset</button>
         </div>
      </main>
   )
}

export default Secret