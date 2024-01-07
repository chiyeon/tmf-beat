import NavBar from "../../components/navbar/navbar.jsx"
import InputField from "../../components/InputField/inputfield.jsx"
import axios from "axios"
import { useState, useEffect, useRef } from "react"

import "./secret.css"

/*
 * data entry for a single person's track
 */
const TrackEntry = (props) => {
   const [title, setTitle] = useState("")
   const [link, setLink] = useState("")
   const [artist, setArtist] = useState("")

   useEffect(() => {
      if (props.track.title !== "") setTitle(props.track.title)
      if (props.track.artist !== "") setArtist(props.track.artist)
      if (props.track.link !== "") setLink(props.track.link)
   }, [props.track])

   useEffect(() => {
      let tracks = [...props.tracks]
      tracks[props.index] = {
         title: title,
         artist: artist,
         link: link,
         winner: false
      }
      props.setTracks(tracks)
   }, [title, link, artist])

   const deleteTrack = () => {
      let tracks = [...props.tracks]
      tracks.splice(props.index, 1)
      props.setTracks(tracks)
   }

   return (
      <div className="track-entry">
         <InputField
            type="text"
            label="Title"
            value={props.track.title}
            onInput={e => setTitle(e.target.value)}
         />
         <InputField
            type="text"
            label="Artist"
            value={props.track.artist}
            onInput={e => setArtist(e.target.value)}
         />
         <InputField
            type="text"
            label="Link"
            value={props.track.link}
            onInput={e => setLink(e.target.value)}
         />

         <button onClick={() => deleteTrack()} className="tag start-button">Remove</button>
      </div>
   )
}

const Secret = () => {

   const [secret, setSecret] = useState("")
   const [category, setCategory] = useState("")
   const [description, setDescription] = useState("")
   const [message, _setMessage] = useState("")
   const [showMessage, setShowMessage] = useState(false)
   const [messageInterval, setMessageInterval] = useState(null)
   const [voteEndTime, setVoteEndTime] = useState(null)

   const voteRef = useRef()

   // for posting new events
   const [tracks, setTracks] = useState([])
   const [title, setTitle] = useState("")
   const [date, setDate] = useState("")

   useEffect(() => {
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

      now.setMilliseconds(null)
      now.setSeconds(null)

      voteRef.current.value = now.toISOString().slice(0, -1);
   }, [voteRef]);

   const setMessage = (message) => {
      _setMessage(message)
      setShowMessage(true)

      if (messageInterval) clearTimeout(messageInterval)
      setMessageInterval(setTimeout(() => setShowMessage(false), 3000))
   }

   const start_vote = async () => {
      let d = new Date();
      let minutes = (voteEndTime - Date.now()) / 1000 / 60;

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

   const new_track = () => {
      setTracks([...tracks, {
         title: "",
         artist: "",
         link: "",
         winner: false
      }])
   }

   const post_tracks = async () => {
      if(title == "") return setMessage("Title is empty!")
      if(date == "") return setMessage("Date is empty!")
      if(tracks.length == 0) return setMessage("No track data!")

      let response
      try {
         response = await axios({
            method: "post",
            url: process.env.REACT_APP_SERVER_URL + "/new-event",
            data: {
               secret: secret,
               event: {
                  title,
                  date,
                  tracks,
                  time: category,
                  description
               }
            }
         })

         setMessage(response.data.message)
      } catch (e) {
         if (e.response.data.message) setMessage(e.response.data.message)
      }
   }

   useEffect(() => {
      console.log(tracks)
   }, [tracks])

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

         <center className="secret-input" >
            <InputField type="password" label="Secret" onInput={e => setSecret(e.target.value)} />
            <p><i>That my Favorite!</i></p>
         </center>

         <div className="admin-box">

            <div className="category">
               <span className="title">
                  <h2>Vote Controls</h2>
                  <hr />
               </span>
               {/*<InputField type="text" label="Vote Duration" onInput={e => setMinutes(parseFloat(e.target.value))} /> */}
               <input type="datetime-local" ref={voteRef} onChange={e => setVoteEndTime(new Date(e.target.value))} />
               <br />
               <br />
               <span className="vote-buttons">
                  <button onClick={() => start_vote()} className="comically-large-button tag start-button">Start</button>
                  <button onClick={() => reset()} className="comically-large-button tag start-button">Reset</button>
               </span>
            </div>

            <div className="category">
               <span className="title">
                  <h2>Create New Event</h2>
                  <hr />
               </span>
               <button className="comically-large-button tag start-button" onClick={() => post_tracks()} >Upload</button>

               <h3>Event Information</h3>
               <hr />
               <br />
               <InputField type="text" label="Title" onInput={e => setTitle(e.target.value)} />
               <InputField type="text" label="Date" onInput={e => setDate(e.target.value)} />
               <InputField type="text" label="Category" onInput={e => setCategory(e.target.value)} />
               <InputField type="textarea" label="Description" onInput={e => setDescription(e.target.value)} />
               
               <h3>Tracklist</h3>
               <hr />
               <button onClick={() => new_track()} className="tag start-button">New Track</button>
               {tracks.map((track, index) => {
                  return <TrackEntry track={track} key={index} index={index} tracks={tracks} setTracks={setTracks} />
               })}
            </div>
         </div>
      </main>
   )
}

export default Secret
