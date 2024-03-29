import "./listen.css"
import NavBar from "../../components/navbar/navbar.jsx"
import Track from "../../components/track/track.jsx"
import { useEffect, useState } from "react"
import axios from "axios"

/*
 * Container for each event. Has a title at the top & list of tracks
 */
const TracksBox = (props) => {
   return (
      <div 
         className="event-tracks-box"
         key={props.event.title}
      >
         <span className="title">
            <p className="tag">{props.event.date}</p>
            <h2>{props.event.title}</h2>
            <p className="tag time">{props.event.time}</p>
            <hr />
         </span>

         {/*<p class="description">{event.description}</p>*/}

         {props.event.tracks.length > 0 ?
               <span>
                  {props.event.tracks.map(track => {
                     return <Track key={track.link} track={track} id={props.playlist.indexOf(track)} index={props.playlist.indexOf(track)} />
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
 * main page
 */
const Listen = (props) => {
   const [events, setEvents] = useState([])                 // copy of events data
   const [displayEvents, setDisplayEvents] = useState([])   // events to display
   const [nameFilter, setNameFilter] = useState([]) // our current filter for names
   const [timeFilter, setTimeFilter] = useState([])
   const [winnersFilter, setWinnersFilter] = useState(false)

   const [showFilter, setShowFilter] = useState(false)

   const [playlist, setPlaylist] = useState([])

   // these bottom two arrays are used to show what displays for the filters
   // todo put this in firebase
   // 0 - fred bear
   // 1 - gab
   // 2 - waymond
   // 3 - tony
   // 4 - chiyeon
   const name_aliases = [
      ['fred bear', 'purple guy', 'bruh', 'beatrice', 'TMFBEAT'],
      ['gab', 'TMFBEAT'],
      ['waymond', 'TMFBEAT', 'waymond & chiyeon'],
      ['tony', '@black', 'TMFBEAT'],
      ['chiyeon', 'TMFBEAT', 'waymond & chiyeon']
   ]
   const categories = [
      ["48 hours"], ["24 hours"], ["30 minutes"], ["10 minutes"], ["5 minutes"], ["Misc", "misc"]
   ]

   const isNameSelected = (names) => {
      // as long as 1 alias is in, we are selected
      return nameFilter.includes(names[0]) ? "selected" : "";
   }

   const isTimeSelected = (times) => {
      return timeFilter.includes(times[0]) ? "selected" : "";
   }

   const update_display_events = () => {
      // basic case: no filters!
      if (nameFilter.length == 0 && !winnersFilter && timeFilter.length == 0) {
         setDisplayEvents(events)

         let playlist = []
         events.forEach(e => {
            e.tracks.forEach(t => {
               playlist.push(t)
            })
         })
         setPlaylist(playlist)
         document.dispatchEvent(new CustomEvent("set_playlist", { detail: playlist }))
      } else {
         let filtered_events = [];

         events.forEach(event => {
            // apply filters
            if (timeFilter.length != 0 && !timeFilter.includes(event.time)) return
            let filtered_tracks = event.tracks.filter(t =>
                  (timeFilter.length != 0 ? timeFilter.includes(event.time) : true)
               && (nameFilter.length != 0 ? nameFilter.includes(t.artist) : true)
               && (winnersFilter ? t.winner : true)
            )

            // // then filter tracks based on winner/name
            // let filtered_tracks = event.tracks.filter(t => 
            //       (nameFilter.length != 0 ? nameFilter.includes(t.artist) : true)
            //    && (winnersFilter ? t.winner : true)
            // )

            if (filtered_tracks.length != 0) {
               // only if we have valid tracks in the event do we make a deep copy
               let filtered_event = {...event}
               filtered_event.tracks = filtered_tracks
               filtered_events.push(filtered_event)
            }
         })

         setDisplayEvents(filtered_events)
         let playlist = []
         filtered_events.forEach(e => {
            e.tracks.forEach(t => {
               playlist.push(t)
            })
         })
         setPlaylist(playlist)
         document.dispatchEvent(new CustomEvent("set_playlist", { detail: playlist }))
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
         //if (target) target.classList.remove("selected")
         setNameFilter(nameFilter.filter(f => !_filter.includes(f)))
      } else {
         //if (target) target.classList.add("selected")
         setNameFilter(nameFilter.concat(_filter))
      }
   }

   const toggleTimeFilter = (target, _filter) => {
      if (timeFilter.includes(_filter[0])) {
         //if (target) target.classList.remove("selected")
         setTimeFilter(timeFilter.filter(t => !_filter.includes(t)))
      } else {
         //if (target) target.classList.add("selected")
         setTimeFilter(timeFilter.concat(_filter))
      }
   }

   const toggleWinnersFilter = (target) => {
      //if (target) winnersFilter ? target.classList.remove("selected") : target.classList.add("selected")
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

         if (events != data) {
            if (process.env.REACT_APP_REMOVE_INVALID_TRACKS == "true") {
               let invalid_tracks = process.env.REACT_APP_INVALID_TRACKS.split("|");
               data.forEach(e => {
                  e.tracks.forEach(t => {
                     if (invalid_tracks.includes(t.title)) {
                        e.tracks = e.tracks.filter(i => i != t);
                     }
                  })

                  if (e.tracks.length == 0) data = data.filter(i => i != e);
               })
            }
            setEvents(data);
         }
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
                  {
                     name_aliases.map(aliases => {
                        return <button className={"tag filter" + isNameSelected(aliases)} onClick={(e) => toggleNameFilter(e.target, aliases)}>{aliases[0]}</button>
                     })
                  }
               </div>
   
               <div className="winners-filter">
                  <p className="search-box-title">Winner</p>
                  <button className={"tag filter" + (winnersFilter ? "selected" : "")} onClick={(e) => toggleWinnersFilter(e.target)}>Winner</button>
               </div>
   
               <div className="time-filter">
                  <p className="search-box-title">Category</p>
                  {
                     categories.map(c => {
                        return <button className={"tag filter" + isTimeSelected(c)} onClick={(e) => toggleTimeFilter(e.target, c)}>{c[0]}</button>
                     }) 
                  }
               </div>
   
               <button className="tag" onClick={() => resetFilter()}>Reset</button>
   
            </div>)
               : ""
         }

         { displayEvents.length === 0 && events.length === 0
            ? (<center><div className="tag loading">Loading</div></center>)
            : displayEvents.length === 0
               ? (<center><div className="tag loading">No Tracks Found</div></center>)
               : displayEvents.map(event => { return <TracksBox key={event.name} event={event} playlist={playlist} />})
         }
      </main>
   )
}

export default Listen
