import "./player.css"
import { useState, useEffect, useRef } from "react"

const Player = () => {
   const [track, setTrack] = useState(-1); // our currently playing track
   const [playlist, setPlaylist] = useState([]); // list of tracks
   const [trackObj, setTrackObj] = useState({});
   const audioRef = useRef(null);

   navigator.mediaSession.setActionHandler('play', () => audioRef.current.play());
   navigator.mediaSession.setActionHandler('pause', () => audioRef.current.pause());
   navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) => {
      audioRef.current.currentTime = seekTime;
   });
   navigator.mediaSession.setActionHandler('previoustrack', () => prev_track());
   navigator.mediaSession.setActionHandler('nexttrack', () => next_track());

   const prev_track = () => {
      if (track <= 0) return;

      setTrack(track - 1)
      document.dispatchEvent(new CustomEvent("update_track_visual", { detail: track - 1 }))
   }

   const next_track = () => {
      if (track >= playlist.length -1) return;

      setTrack(track + 1)
   }

   useEffect(() => {
      document.addEventListener("set_track", (e) => { setTrack(e.detail) })
      document.addEventListener("set_playlist", (e) => { setPlaylist(e.detail); })
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

      navigator.mediaSession.metadata = new MediaMetadata({
         title: trackObj.title,
         artist: trackObj.artist,
         album: "That my Favorite!",
         artwork: [
            {
               src: "https://cdn.discordapp.com/attachments/1109658173373153300/1192021024921878548/listen2_logo1.png?ex=65a78f17&is=65951a17&hm=3f019bb2d8b11beb069022fe41370a11bb211593dee817a099dd7fbf565f6d50&",
               sizes: "96x96",
               type: "image/png"
            },
            {
               src: "https://cdn.discordapp.com/attachments/1109658173373153300/1192021024921878548/listen2_logo1.png?ex=65a78f17&is=65951a17&hm=3f019bb2d8b11beb069022fe41370a11bb211593dee817a099dd7fbf565f6d50&",
               sizes: "128x128",
               type: "image/png"
            },
            {
               src: "https://cdn.discordapp.com/attachments/1109658173373153300/1192037377892438016/listen2_logo1bigibg.png?ex=65a79e51&is=65952951&hm=9df6e11e9de4f91b21551a12e6552d5b2d52841411894bec8d1ed95c78ab3307&",
               sizes: "192x192",
               type: "image/png"
            },
            {
               src: "https://cdn.discordapp.com/attachments/1109658173373153300/1192037377892438016/listen2_logo1bigibg.png?ex=65a79e51&is=65952951&hm=9df6e11e9de4f91b21551a12e6552d5b2d52841411894bec8d1ed95c78ab3307&",
               sizes: "256x256",
               type: "image/png"
            },
            {
               src: "https://cdn.discordapp.com/attachments/1109658173373153300/1192037377892438016/listen2_logo1bigibg.png?ex=65a79e51&is=65952951&hm=9df6e11e9de4f91b21551a12e6552d5b2d52841411894bec8d1ed95c78ab3307&",
               sizes: "384x384",
               type: "image/png"
            },
            { 
               src: "https://cdn.discordapp.com/attachments/1109658173373153300/1192037377892438016/listen2_logo1bigibg.png?ex=65a79e51&is=65952951&hm=9df6e11e9de4f91b21551a12e6552d5b2d52841411894bec8d1ed95c78ab3307&",
               sizes: "512x512",
               type: "image/png"
            },
         ],
       });

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
                     <div className="track-title">
                        {trackObj.winner ? <div className="tag">winner</div> : ''}
                        <p>{trackObj.artist} - <strong>{trackObj.title}</strong></p>
                     </div>
                  ) : (
                     <div className="track-title">
                        <p><i>No tracks playing</i></p>
                     </div>
                  )
               }
               <div className="media">
                  <svg onClick={prev_track} className="flipped" viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssketch="http://www.bohemiancoding.com/sketch/ns" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>forward</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketchtype="MSPage"> <g id="Icon-Set-Filled" sketchtype="MSLayerGroup" transform="translate(-570.000000, -571.000000)" fill="#ffffff"> <path d="M601.415,583.561 L584.429,571.372 C583.303,570.768 582.013,570.625 582.012,572.951 L582.012,578.256 L572.417,571.372 C571.291,570.768 569.969,570.75 570,573.014 L570,596.955 C570.032,599 571.385,599.296 572.417,598.628 L582.012,591.744 L582.012,596.986 C582.013,598.969 583.396,599.296 584.429,598.628 L601.415,586.44 C602.197,585.645 602.197,584.355 601.415,583.561" id="forward" sketchtype="MSShapeGroup"> </path> </g> </g> </g></svg>
                  <audio
                     ref={audioRef}
                     controls
                     autoPlay
                  >
                     {trackObj.link !== undefined ? <source src={trackObj.link} /> : ""}
                  </audio>
                  <svg onClick={next_track} viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssketch="http://www.bohemiancoding.com/sketch/ns" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>forward</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketchtype="MSPage"> <g id="Icon-Set-Filled" sketchtype="MSLayerGroup" transform="translate(-570.000000, -571.000000)" fill="#ffffff"> <path d="M601.415,583.561 L584.429,571.372 C583.303,570.768 582.013,570.625 582.012,572.951 L582.012,578.256 L572.417,571.372 C571.291,570.768 569.969,570.75 570,573.014 L570,596.955 C570.032,599 571.385,599.296 572.417,598.628 L582.012,591.744 L582.012,596.986 C582.013,598.969 583.396,599.296 584.429,598.628 L601.415,586.44 C602.197,585.645 602.197,584.355 601.415,583.561" id="forward" sketchtype="MSShapeGroup"> </path> </g> </g> </g></svg>
                  {/* <div className="controls">
                     <svg onClick={prev_track} className="flipped" viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssketch="http://www.bohemiancoding.com/sketch/ns" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>forward</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketchtype="MSPage"> <g id="Icon-Set-Filled" sketchtype="MSLayerGroup" transform="translate(-570.000000, -571.000000)" fill="#ffffff"> <path d="M601.415,583.561 L584.429,571.372 C583.303,570.768 582.013,570.625 582.012,572.951 L582.012,578.256 L572.417,571.372 C571.291,570.768 569.969,570.75 570,573.014 L570,596.955 C570.032,599 571.385,599.296 572.417,598.628 L582.012,591.744 L582.012,596.986 C582.013,598.969 583.396,599.296 584.429,598.628 L601.415,586.44 C602.197,585.645 602.197,584.355 601.415,583.561" id="forward" sketchtype="MSShapeGroup"> </path> </g> </g> </g></svg>
                     <svg onClick={next_track} viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnssketch="http://www.bohemiancoding.com/sketch/ns" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>forward</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketchtype="MSPage"> <g id="Icon-Set-Filled" sketchtype="MSLayerGroup" transform="translate(-570.000000, -571.000000)" fill="#ffffff"> <path d="M601.415,583.561 L584.429,571.372 C583.303,570.768 582.013,570.625 582.012,572.951 L582.012,578.256 L572.417,571.372 C571.291,570.768 569.969,570.75 570,573.014 L570,596.955 C570.032,599 571.385,599.296 572.417,598.628 L582.012,591.744 L582.012,596.986 C582.013,598.969 583.396,599.296 584.429,598.628 L601.415,586.44 C602.197,585.645 602.197,584.355 601.415,583.561" id="forward" sketchtype="MSShapeGroup"> </path> </g> </g> </g></svg>
                  </div> */}
               </div>
            </div>
            
         </div>
      </div>
   )
}

export default Player
