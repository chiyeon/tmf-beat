import "./listen.css"
import NavBar from "../../components/navbar/navbar.jsx"
import { useEffect, useState } from "react"
import axios from "axios"

/*
 * Container for each event. Has a title at the top & list of tracks
 */
const TracksBox = (event) => {
   return (
      <div 
      className="event-tracks-box"
         key={event.title}
      >
         <span className="title">
            <p className="tag">{event.date}</p>
            <h2>{event.title}</h2>
            <hr />
         </span>

         {/*<p class="description">{event.description}</p>*/}

         {event.tracks.length > 0 ?
               <span>
                  {event.tracks.map(track => {
                     return Track(track)
                  })}
               </span>
            :
               <span>
                  <p>Coming soon!</p>
               </span>
         }   
      </div>
   )
}

/*
 * one singular track, inside a track box
 */
const Track = (track) => {
   return (
      <div className="track" key={track.artist}>
         <span className="track-title">
            {track.winner ? <div className="tag">winner</div> : ''}
            <p>{track.artist} - <strong>{track.title}</strong></p>
         </span>
         <audio className="audio" controls>
            <source src={track.link} />
            Your browser does not support the audio element.
         </audio>
      </div>
   )
}

/*
 * main page
 */
const Listen = () => {
   const [events, setEvents] = useState([])

   useEffect(() => {
      if (window.chrome)
         document.querySelectorAll("audio").forEach(e => {
            e.classList.add("chrome-audio")
         })
      
      const fetchData = async () => {
         let data = (await axios({
            method: "get",
            url: process.env.REACT_APP_SERVER_URL + "/events",
            responseType: "json"
         })).data.events.reverse()

         setEvents(data)
      }

      fetchData()
   })

   return (
      <main className="listen">
         <span className="site-title">
            <h1>listen</h1>
            <h1>2</h1>
         </span>

         <NavBar />

         { events.length === 0
            ? (<center><div className="tag">Loading...</div></center>)
            : events.map(event => { return TracksBox(event) })
         }
      </main>
   )
}

export default Listen