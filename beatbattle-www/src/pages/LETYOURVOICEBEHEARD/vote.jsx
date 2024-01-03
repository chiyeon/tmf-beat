import "./vote.css"
import { useEffect, useState } from "react"
import axios from "axios"
import NavBar from "../../components/navbar/navbar.jsx"
import InputField from "../../components/InputField/inputfield.jsx"

const Vote = () => {
   const [message, _setMessage] = useState("")
   const [showMessage, setShowMessage] = useState(false)
   const [tracks, setTracks] = useState([])
   const [vote_id, setVoteID] = useState(0)
   const [target, setTarget] = useState(null)
   const [secret, setSecret] = useState("")
   const [remainingTime, setRemainingTime] = useState(0)
   const [endTime, setEndTime] = useState(0)
   const [timeOffset, setTimeOffset] = useState(0)
   const [winners, setWinners] = useState(null)

   const [messageInterval, setMessageInterval] = useState(null)
   const [timerInterval, setTimerInterval] = useState(null) // this keeps track of the timer ticking down per second
   const [timerUpdateInterval, setTimerUpdateInterval] = useState(null) // this updates our timer with the system timer periodically
   
   useEffect(() => {
      const fetchData = async () => {
         let data = (await axios({
            method: "get",
            url: process.env.REACT_APP_SERVER_URL + "/tracks",
            responseType: "json"
         })).data.tracks

         setTracks(data)

         let now = (await axios({
            method: "get",
            url: process.env.REACT_APP_SERVER_URL + "/time-now",
            responseType: "json"
         })).data.time
         if (now && now != 0) setTimeOffset(Date.now() - now)

         // set end time after setting now...
         // start_timer is triggered by change in end time !!!
         let end_time = (await axios({
            method: "get",
            url: process.env.REACT_APP_SERVER_URL + "/time",
            responseType: "json"
         })).data.time
         
         setEndTime(end_time)

         let _winners = (await axios({
            method: "get",
            url: process.env.REACT_APP_SERVER_URL + "/winners",
            responseType: "json"
         })).data.winners

         setWinners(_winners)
      }

      if (window.chrome)
         document.querySelectorAll("audio").forEach(e => {
            e.classList.add("chrome-audio")
         })

      fetchData()
   }, [])

   useEffect(() => {
      if (remainingTime <= 0) {
         stop_timer()
      }
   }, [remainingTime])

   useEffect(() => {
      if (endTime != 0) start_timer()
   }, [endTime])

   // stops the TIMER itself. nothing to do with updating time
   const stop_timer = () => {
      if (timerInterval) {
         clearInterval(timerInterval)
         setTimerInterval(null)
      }
   }

   const start_timer = () => {
      if (timerInterval) stop_timer()

      setRemainingTime(remainingTime => Math.floor((endTime + timeOffset - Date.now()) / 1000))
      setTimerInterval(setInterval(() => {
         setRemainingTime(remainingTime => Math.floor((endTime + timeOffset - Date.now()) / 1000))
      }, 1000))
   }

   const setMessage = (message) => {
      _setMessage(message)
      setShowMessage(true)

      if (messageInterval) clearTimeout(messageInterval)
      setMessageInterval(setTimeout(() => setShowMessage(false), 3000))
   }

   const set_vote = (vote_index, e) => {
      setVoteID(vote_index)

      if (target) target.classList.remove("selected")
      e.currentTarget.classList.add("selected")
      setTarget(e.currentTarget)

      let thatmyfavorite = new Audio("../../assets/thatmyfavorite.mp3")
      thatmyfavorite.play()
   }

   const send_vote = async () => {
      let response
      try {
         response = await axios({
            method: "post",
            url: process.env.REACT_APP_SERVER_URL + "/vote",
            data: {
               secret: secret,
               target: vote_id,
            }
         })

         setMessage(response.data.message)
      } catch (e) {
         if (e.response.data.message) setMessage(e.response.data.message)
      }
   }

   return (
      <main className="voice">
         <div className="monke">
            <h1>LET YOUR VOICE BE HEARD</h1>

            <p>Choose a NEW required beat element.</p>

            <form action="https://docs.google.com/forms/d/e/1FAIpQLSeuMXWvCMPQKYKHR-8pYz7sV7FkKTUtBLyzW-46LC9vtlqzbA/formResponse" >
               <select name="entry.1941424285">
                  <option value="AI+Generated+Elements">AI Generated Sounds</option>
                  <option value="Vocals">Vocals</option>
                  <option value="Free+for+all+(No+Requirements/samples)">No Requirements/samples</option>
               </select>

               <label for="entry.253964163">Availability:</label>
               <input type="text" name="entry.253964163" placeholder="9/8 - 9/11..."></input>

               <button>Submit</button>
            </form>
         </div>
      </main>
   )
}

export default Vote