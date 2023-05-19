import "./home.css"
import NavBar from "../../components/navbar/navbar.jsx"

const playthatmyfavorite = () => {
   let thatmyfavorite = new Audio("../../assets/thatmyfavorite.mp3")
   thatmyfavorite.play()
}

const Home = () => {
   return (
      <main>
         <span className="site-title">
            <h1>that my favorite</h1>
            <h1>beat</h1>
         </span>

         <NavBar />

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
            <p onClick={() => playthatmyfavorite()} id="thatmyfavorite" className="tag">That my favorite!</p>
         </div>
      </main>
   )
}

export default Home
