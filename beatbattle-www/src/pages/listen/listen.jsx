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
      <div className="track" key={track.title}>
         <span className="track-title">
            {track.winner ? <div className="tag">winner</div> : ''}
            <p>{track.artist} - <strong>{track.title}</strong></p>
         </span>
         <audio
            className="audio"
            onPlay={(e) => {
               document.querySelectorAll("audio").forEach(a => {
                  if (a != e.target) a.pause()
               })
            }}
            controls
         >
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
   const [events, setEvents] = useState([])                 // copy of events data
   const [displayEvents, setDisplayEvents] = useState([])   // events to display
   const [filter, _setFilter] = useState([]) // our current filter for names
   const [winnersFilter, setWinnersFilter] = useState(false)

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

   // toggles target filter on/off.
   const toggleNameFilter = (target, _filter) => {
      // check if we are removing a filter from our search
      if (filter.includes(_filter[0])) {
         if (target) target.classList.remove("selected")
         _setFilter(filter.filter(f => !_filter.includes(f)))
      } else {
      if (target) target.classList.add("selected")
         _setFilter(filter.concat(_filter))
      }
   }

   const resetNameFilter = () => {
      document.querySelectorAll(".name-filter .filter").forEach(e => {
         e.classList.remove("selected")
      })

      _setFilter([])
   }

   const update_display_events_from_filter = () => {
      let filtered_events = [];

      [...events].forEach(event => {
         let filtered_event = event;
         filtered_event.tracks = filtered_event.tracks.filter(t => filter.includes(t.artist))
         if (filtered_event.tracks.length != 0)
            filtered_events.push(filtered_event)
      })

      setDisplayEvents(filtered_events)
   }

   const toggleWinnersFilter = (target) => {
      if (target) winnersFilter ? target.classList.remove("selected") : target.classList.remove("add")

      setWinnersFilter(!winnersFilter)
   }

   const resetWinnersFilter = () => {
      document.querySelectorAll(".winners-filter .filter").forEach(e => {
         e.classList.remove("selected")
      })
   }

   useEffect(() => {
      // on event update, restore filters if set or just reload
      if (filter.length != 0) {
         update_display_events_from_filter()
      } else {
         setDisplayEvents(events)
      }
   }, [ events ])

   return (
      <main className="listen">
         <span className="site-title">
            <h1>listen</h1>
            <h1>2</h1>
         </span>

         <NavBar />

         <div className="search-box">
            <div className="name-filter">
               <h3 className="search-box-title">Filter by Artist</h3>

               <button className="tag" onClick={() => resetNameFilter()}>Reset</button>
               <p>|</p>
               <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['fred bear', 'purple guy', 'bruh', 'beatrice'])}>fred bear</button>
               <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['gab'])}>gab</button>
               <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['waymond'])}>waymond</button>
               <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['tony', '@black'])}>@black</button>
               <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['chiyeon'])}>chiyeon</button>
            </div>
         </div>

         { displayEvents.length === 0
            ? (<center><div className="tag loading">Loading...</div></center>)
            : displayEvents.map(event => { return TracksBox(event) })
         }
      </main>
   )
}

export default Listen