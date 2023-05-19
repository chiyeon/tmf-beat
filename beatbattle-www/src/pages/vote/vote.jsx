import "./vote.css"
import { useEffect, useState } from "react"
import axios from "axios"
import NavBar from "../../components/navbar/navbar.jsx"
import InputField from "../../components/InputField/inputfield.jsx"

const Track = (track, on_click, index) => {
   return (
      <div onClick={(e) => on_click(index, e)} className="track" key={track.artist}>
         <div className="track-main">
            <span className="track-title">
               <p>{track.artist} - <strong>{track.title}</strong></p>
            </span>
            <audio className="audio" controls>
               <source src={track.link} />
               Your browser does not support the audio element.
            </audio>
         </div>
         {/*<div className="track-monkey">
            <img src="https://cdn.discordapp.com/attachments/222509622576021504/1101436648409018409/Brass_Monkey.png" alt="Brass Monkey" />
         </div>*/}
      </div>
   )
}

const Vote = () => {
   const [message, _setMessage] = useState("")
   const [showMessage, setShowMessage] = useState(false)
   const [tracks, setTracks] = useState([])
   const [vote_id, setVoteID] = useState(0)
   const [target, setTarget] = useState(null)
   const [secret, setSecret] = useState("")
   const [remainingTime, setRemainingTime] = useState(0)
   const [endTime, setEndTime] = useState(0)
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

      setRemainingTime(remainingTime => Math.floor((endTime - Date.now()) / 1000))
      setTimerInterval(setInterval(() => {
         setRemainingTime(remainingTime => Math.floor((endTime - Date.now()) / 1000))
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
      <main className="vote">
         <span className="site-title">
            <h1>vote</h1>
            <h1>4</h1>
         </span>

         <NavBar />
   
         <div 
            className = {
               showMessage === false
               ? "notification tag hidden"
               : "notification tag"
            }
         >{message}</div>

         {
            (winners) ? winners.length === 0
            ? tracks.length === 0 ?
               <center className="voting-not-started-hint">
                  <h2>Voting hasn't started yet.</h2>
                  <p className="tag">Check back soon!</p>
               </center>
               :
               <span>
                  <span className="title">
                     <p className="tag">That my favorite!</p>
                     <h2>Watch the time!</h2>
                     <hr />
                  </span>
   
                  {
                     remainingTime <= 0 ? "" :
                     <div className="clock">
                        <h1>{Math.floor(remainingTime / 60 / 60)}:{ Math.floor(remainingTime / 60) % 60 < 10 ? "0" + Math.floor(remainingTime / 60) % 60 : Math.floor(remainingTime / 60) % 60 }:{ remainingTime % 60 < 10 ? "0" + remainingTime % 60 : remainingTime % 60 }</h1>
                     </div>
                  }
   
                  <span className="title">
                     <p className="tag">That my favorite!</p>
                     <h2>Select a Song</h2>
                     <hr />
                  </span>
   
                  {tracks.length > 0 ?
                     <span>
                        {tracks.map(track => {
                           return Track(track, set_vote, tracks.indexOf(track))
                        })}
                     </span>
                  :
                     <span>
                        <p>Loading...</p>
                     </span>
                  }
            
                  <span className="title">
                     <p className="tag">That my favorite!</p>
                     <h2>And Vote!</h2>
                     <hr />
                  </span>
   
                  <InputField
                     label="Secret"
                     type="password"
                     onInput={e => setSecret(e.target.value)}
                  />
   
                  <button className="tag" onClick={(e) => { e.preventDefault(); send_vote()}}>Vote!</button>
               </span>
            : <div className="winners">
               <span className="title">
                  <p className="tag">YOU are my favorite!</p>
                  <h2>The Winners</h2>
                  <hr />
               </span>
               {winners.map(winner => {
                  return (
                     <div className={winner.winner ? "winner big" : "winner"} key={winner.artist}>
                        <p>{winner.artist} - <strong>{winner.title}</strong></p>
                        <p className="votes">{winner.votes}/{winner.totalVotes}</p>
                     </div>
                  )
               })}

               <center><p className="tag">Thanks for submitting!</p></center>
            </div>
            :
            <div>
               <center>
                  <p className="tag">Loading...</p>
               </center>
            </div>
         }
      </main>
   )
}

export default Vote