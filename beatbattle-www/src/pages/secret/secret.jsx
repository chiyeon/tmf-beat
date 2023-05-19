import NavBar from "../../components/navbar/navbar.jsx"
import axios from "axios"
import { useState } from "react"

import "./secret.css"

const Secret = () => {

   const [secret, setSecret] = useState("")

   const start_vote = async () => {
      let response
      try {
         response = await axios({
            method: "post",
            url: process.env.REACT_APP_SERVER_URL + "/start",
            data: {
               secret: secret
            }
         })
      } catch (e) {
         if (e.response.data.message) console.log(e.response.data.message)
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
      } catch (e) {
         if (e.response.data.message) console.log(e.response.data.message)
      }
   }

   return (
      <main class="secret">
         <span className="site-title">
            <h1>secret</h1>
            <h1>page</h1>
         </span>

         <NavBar />

         <div class="cent">
            <input type="password" onInput={e => setSecret(e.target.value)} />
            <button onClick={() => start_vote()} class="tag start-button">Start Vote</button>
            <button onClick={() => reset()} class="tag start-button">Reset</button>
         </div>
      </main>
   )
}

export default Secret