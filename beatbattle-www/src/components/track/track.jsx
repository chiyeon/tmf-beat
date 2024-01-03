import "./track.css"
import { publish, subscribe } from "../../events.js"
import { useRef, useEffect } from "react"
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'

/*
 * one singular track, inside a track box
 */
const Track = (props) => {

   const trackRef = useRef()
   const audioRef = useRef()
   const waveformRef = useRef()

   const set_track = (track) => {
      let prev = document.querySelector(".track.selected")
      if (prev) prev.classList.remove("selected")

      trackRef.current.classList.add("selected");

      publish("set_track", props.index)
   }

   return (
      <div id={"track-" + props.id} className="track" key={props.track.title} onClick={() => set_track(props.track)} ref={trackRef}>
         <span className="track-title">
            {props.track.winner ? <div className="tag">winner</div> : ''}
            <p>{props.track.artist} - <strong>{props.track.title}</strong></p>
         </span>
         <audio ref={audioRef}>
            <source src={props.track.link} />
            Your browser does not support the audio element.
         </audio>
      </div>
   )
}

export default Track;