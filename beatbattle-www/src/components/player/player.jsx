import "./player.css"
import icon from "./ukiwhat.jpg"
import { subscribe, unsubscribe, publish } from "../../events.js"
import { useState, useEffect, useRef } from "react"

const Player = () => {
   const [track, setTrack] = useState(-1); // our currently playing track
   const [playlist, setPlaylist] = useState([]); // list of tracks
   const [trackObj, setTrackObj] = useState({});
   const audioRef = useRef(null);

   navigator.mediaSession.setActionHandler('play', () => audioRef.current.play());
   navigator.mediaSession.setActionHandler('pause', () => audioRef.current.pause());
   navigator.mediaSession.setActionHandler('previoustrack', () => prev_track());
   navigator.mediaSession.setActionHandler('nexttrack', () => next_track());

   const prev_track = () => {
      if (track <= 0) return;

      setTrack(track - 1)
      publish("update_track_visual", track - 1)

   }

   const next_track = () => {
      if (track >= playlist.length -1) return;

      setTrack(track + 1)
   }

   useEffect(() => {
      subscribe("set_playlist", (e) => { setPlaylist(e.detail) })
      subscribe("set_track", (e) => { setTrack(e.detail) })
   }, [])

   useEffect(() => {
      let prev = document.querySelector(".track.selected")
      if (prev) prev.classList.remove("selected")

      let next = document.querySelector(`#track-${track}`);
      if (next) next.classList.add("selected");
      if (playlist[track] !== undefined) setTrackObj(playlist[track])
   }, [track])

   useEffect(() => {
      if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.load();
      }

      audioRef.current.addEventListener("ended", () => {
         next_track();
      })
   }, [trackObj])

   return (
      <div className="player">
         <div className={trackObj.winner !== undefined ? "content" : "content disabled"}>
            {/*<img className="icon" src={icon} />*/}
            <div className="right">
               {
                  trackObj.winner !== undefined ? (
                     <span className="track-title">
                        {trackObj.winner ? <div className="tag">winner</div> : ''}
                        <p>{trackObj.artist} - <strong>{trackObj.title}</strong></p>
                     </span>
                  ) : (
                     <span className="track-title">
                        <p><i>No tracks playing</i></p>
                     </span>
                  )
               }
               <div className="media">
                  <audio
                     ref={audioRef}
                     controls
                     autoPlay
                  >
                     {trackObj.link !== undefined ? <source src={trackObj.link} /> : ""}
                  </audio>
                  <div className="controls">
                     <svg onClick={prev_track} className="flipped" viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssketch="http://www.bohemiancoding.com/sketch/ns" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>forward</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketchtype="MSPage"> <g id="Icon-Set-Filled" sketchtype="MSLayerGroup" transform="translate(-570.000000, -571.000000)" fill="#ffffff"> <path d="M601.415,583.561 L584.429,571.372 C583.303,570.768 582.013,570.625 582.012,572.951 L582.012,578.256 L572.417,571.372 C571.291,570.768 569.969,570.75 570,573.014 L570,596.955 C570.032,599 571.385,599.296 572.417,598.628 L582.012,591.744 L582.012,596.986 C582.013,598.969 583.396,599.296 584.429,598.628 L601.415,586.44 C602.197,585.645 602.197,584.355 601.415,583.561" id="forward" sketchtype="MSShapeGroup"> </path> </g> </g> </g></svg>
                     <svg onClick={next_track} viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssketch="http://www.bohemiancoding.com/sketch/ns" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>forward</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketchtype="MSPage"> <g id="Icon-Set-Filled" sketchtype="MSLayerGroup" transform="translate(-570.000000, -571.000000)" fill="#ffffff"> <path d="M601.415,583.561 L584.429,571.372 C583.303,570.768 582.013,570.625 582.012,572.951 L582.012,578.256 L572.417,571.372 C571.291,570.768 569.969,570.75 570,573.014 L570,596.955 C570.032,599 571.385,599.296 572.417,598.628 L582.012,591.744 L582.012,596.986 C582.013,598.969 583.396,599.296 584.429,598.628 L601.415,586.44 C602.197,585.645 602.197,584.355 601.415,583.561" id="forward" sketchtype="MSShapeGroup"> </path> </g> </g> </g></svg>
                  </div>
               </div>
            </div>
            
         </div>
      </div>
   )
}

export default Player