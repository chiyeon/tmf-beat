import "./home.css"
import NavBar from "../../components/navbar/navbar.jsx"
import { useEffect, useState } from "react"
import axios from "axios"

const playthatmyfavorite = () => {
   let thatmyfavorite = new Audio("../../assets/thatmyfavorite.mp3")
   thatmyfavorite.play()
}

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

const Home = () => {
   const [display_tracks, set_display_tracks] = useState([])

   useEffect(() => {
      const fetchData = async () => {
         let data = (await axios({
            method: "get",
            url: process.env.REACT_APP_SERVER_URL + "/display-tracks",
            responseType: "json"
         })).data.display_tracks

         set_display_tracks(data)
         console.log(data)
      }
      
      fetchData()
   }, [])

   return (
      <main>
         <span className="site-title">
            <h1>thatmy</h1>
            <h1>fav</h1>
         </span>

         <NavBar />

         <span className="title">
            <h2>About Us</h2>
            <hr />
         </span>

         <p>Welcome to That My Favorite Beat, the 24/48 hour beat challenge! Make a beat in a limited time span using required samples, then vote on your favorite!</p>

         <div className="process-box">
            <span className="process" >
               <h1 className="highlight">produce</h1>
               <h1 className="accent">1</h1>
               <h1>beat</h1>
            </span>
            <span className="process" style={{paddingLeft: "3rem"}}>
               <h1 className="highlight">listen</h1>
               <h1 className="accent">2</h1>
               <h1>them all</h1>
            </span>
            <span className="process" style={{paddingLeft: "3rem"}}>
               <h1 className="highlight">think</h1>
               <h1 className="accent">3</h1>
               <h1>think</h1>
            </span>
            <span className="process" style={{paddingLeft: "3rem"}}>
               <h1 className="highlight">vote</h1>
               <h1 className="accent">4</h1>
               <h1>your favorite!</h1>
            </span>
         </div>

         <br />

         <span className="title">
            <h2>Listen to our favorites!</h2>
            <hr />
         </span>

         {display_tracks.length > 0 ?
               <span>
                  {display_tracks.map(track => {
                     return Track(track)
                  })}
               </span>
            :
               <span>
                  <p>Loading...</p>
               </span>
         } 

         <p onClick={() => playthatmyfavorite()} id="thatmyfavorite" className="tag">That my favorite!</p>
      </main>
   )
}

export default Home
