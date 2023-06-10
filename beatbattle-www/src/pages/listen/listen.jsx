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
   const [nameFilter, setNameFilter] = useState([]) // our current filter for names
   const [timeFilter, setTimeFilter] = useState([])
   const [winnersFilter, setWinnersFilter] = useState(false)

   const [showFilter, setShowFilter] = useState(false)

   const update_display_events = () => {
      // basic case: no filters!
      if (nameFilter.length == 0 && !winnersFilter && timeFilter.length == 0) {
         setDisplayEvents(events)
      } else {
         let filtered_events = [];

         events.forEach(event => {
            // skip if not in time filter
            if (timeFilter.length != 0 && !timeFilter.includes(event.time)) return

            // then filter tracks based on winner/name
            let filtered_tracks = event.tracks.filter(t => 
                  (nameFilter.length != 0 ? nameFilter.includes(t.artist) : true)
               && (winnersFilter ? t.winner : true)
            )

            if (filtered_tracks.length != 0) {
               // only if we have valid tracks in the event do we make a deep copy
               let filtered_event = {...event}
               filtered_event.tracks = filtered_tracks
               filtered_events.push(filtered_event)
            }
         })

         setDisplayEvents(filtered_events)
      }
   }

   const resetFilter = () => {
      document.querySelectorAll(".filter").forEach(e => {
         e.classList.remove("selected")
      })

      setNameFilter([])
      setTimeFilter([])
      setWinnersFilter(false)
   }

   // toggles target filter on/off.
   const toggleNameFilter = (target, _filter) => {
      // check if we are removing a filter from our search
      if (nameFilter.includes(_filter[0])) {
         if (target) target.classList.remove("selected")
         setNameFilter(nameFilter.filter(f => !_filter.includes(f)))
      } else {
         if (target) target.classList.add("selected")
         setNameFilter(nameFilter.concat(_filter))
      }
   }

   const toggleTimeFilter = (target, _time) => {
      if (timeFilter.includes(_time)) {
         if (target) target.classList.remove("selected")
         setTimeFilter(timeFilter.filter(t => t != _time))
      } else {
         if (target) target.classList.add("selected")
         setTimeFilter([...timeFilter, _time])
      }
   }

   const toggleWinnersFilter = (target) => {
      if (target) winnersFilter ? target.classList.remove("selected") : target.classList.add("selected")
      setWinnersFilter(!winnersFilter)
   }

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

         if (events != data) setEvents(data)
      }
      
      fetchData()
   }, [])

   useEffect(() => {
      update_display_events()
   }, [ events, nameFilter, winnersFilter, timeFilter ])

   return (
      <main className="listen">
         <span className="site-title">
            <h1>listen</h1>
            <h1>2</h1>
         </span>

         <NavBar />

         <div
            onClick={() => setShowFilter(!showFilter)}
            className="filter-toggle-box"
         >
            <h3>Filter by</h3>
            <p 
               className={"filter-toggle " + (showFilter ? "flipped" : "")}
            >▼</p>
         </div>

         {
            showFilter
               ? (<div className="search-box">
               <div className="name-filter">
                  <p className="search-box-title">Artist</p>
                  <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['fred bear', 'purple guy', 'bruh', 'beatrice'])}>fred bear</button>
                  <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['gab'])}>gab</button>
                  <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['waymond'])}>waymond</button>
                  <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['tony', '@black'])}>@black</button>
                  <button className="tag filter" onClick={(e) => toggleNameFilter(e.target, ['chiyeon'])}>chiyeon</button>
               </div>
   
               <div className="winners-filter">
                  <p className="search-box-title">Winner</p>
   
                  <button className="tag filter" onClick={(e) => toggleWinnersFilter(e.target)}>Winner</button>
               </div>
   
               <div className="time-filter">
                  <p className="search-box-title">Time</p>
                  <button className="tag filter" onClick={(e) => toggleTimeFilter(e.target, "48 hours")}>48 hours</button>
                  <button className="tag filter" onClick={(e) => toggleTimeFilter(e.target, "24 hours")}>24 hours</button>
                  <button className="tag filter" onClick={(e) => toggleTimeFilter(e.target, "10 minutes")}>10 minutes</button>
                  <button className="tag filter" onClick={(e) => toggleTimeFilter(e.target, "5 minutes")}>5 minutes</button>
               </div>
   
               <button className="tag" onClick={() => resetFilter()}>Reset</button>
   
            </div>)
               : ""
         }

         { displayEvents.length === 0 && events.length === 0
            ? (<center><div className="tag loading">Loading</div></center>)
            : displayEvents.length === 0
               ? (<center><div className="tag loading">No Tracks Found</div></center>)
               : displayEvents.map(event => { return TracksBox(event) })
         }
      </main>
   )
}

export default Listen