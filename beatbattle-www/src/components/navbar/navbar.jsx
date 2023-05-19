import { NavLink } from "react-router-dom"

const NavBar = () => {
   return (
      <div className="directory">
         <NavLink className={({ isActive }) => (isActive ? "tag active" : "tag")} to="/">Home</NavLink>
         <NavLink className={({ isActive }) => (isActive ? "tag active" : "tag")} to="/listen">Listen</NavLink>
         <NavLink className={({ isActive }) => (isActive ? "tag active" : "tag")} to="/vote">Vote</NavLink>
      </div>
   )
}

export default NavBar