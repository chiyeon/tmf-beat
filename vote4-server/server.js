/*
 * Initial Setup
 */

// global stuff
const { print } = require("./utils.js")
// setup for server
const app = require("express")()
const server = require("http").createServer(app)
const cors = require("cors")
const body_parser = require("body-parser")
// misc
var end_time = process.env.END_TIME
const firebase = require("./firebase.js")
var tracks, users

/*
 * FUNCTIONS
 */

/*
 * retrieves all votes saved in firebase & calculates scoreboard, putting it
 * in beatbattle/winners/data 
 */
const set_winners = async () => {
   end_time = null
   let votes = await firebase.get_collection("votes")

   let processed_votes = {}
   for (let i = 0; i < tracks.length; ++i) processed_votes[i] = 0

   Object.keys(votes).forEach(vote_author => {
      processed_votes[votes[vote_author]]++;
   })

   let winners = Object.keys(processed_votes).map(
      (_key) => {
         let key = parseInt(_key)

         return {
            "artist": tracks[key].artist,
            "title": tracks[key].title,
            "winner": false,
            "votes": processed_votes[_key],
            "totalVotes": Object.keys(votes).length
         }
      }
   )

   winners.sort((a, b) => b.votes - a.votes)

   let winning_vote = winners[0].votes

   winners.forEach(winner => {
      if (winner.votes >= winning_vote) {
         winner.winner = true
      }
   })

   await firebase.set_doc_path("beatbattle/winners", {
      data: winners
   })

   print("Vote has concluded!")
}

const on_vote = async (req, res) => {
   try {
      const vote = {
         secret: req.body.secret,
         target: parseInt(req.body.target),
         author: users[req.body.secret]
      }
      
      if (vote.author === undefined) return res.status(400).json({ message: "Error: Invalid Secret" })
      if (vote.target < 0 || vote.target >= tracks.length) return res.status(400).json({ message: "Error: Invalid Vote" })
      if (vote.author == tracks[vote.target].artist) return res.status(400).json({ message: "Error: You cannot vote for yourself!" })
      if (end_time < Date.now()) return res.status(400).json({ message: "The time to vote has ended!"})

      print("recieved vote from " + vote.author)

      await firebase.set_doc("votes", vote.author, {
         author: vote.author,
         target: vote.target
      })

      return res.status(200).json({ message: `Thank you for voting, ${vote.author}!`})
   } catch (e) {
      print(e)
   }
}

const on_vote_start = async (req, res) => {
   try {
      const request = {
         secret: req.body.secret,
         author: users[req.body.secret],
      }

      if (request.author === undefined) return res.status(400).json({ message: "Invalid Secret"})
      if (request.author !== "chiyeon") return res.status(400).json({ message: "You aren't admin!"})

      print("The vote is starting!")
      end_time = Date.now() + (1000 * 60 * process.env.VOTE_LENGTH_MINUTES)
      setTimeout(() => {
         set_winners()
         end_time = null
      }, 1000 * 60 * process.env.VOTE_LENGTH_MINUTES)

      return res.status(200).json({ message: "Vote started!" })
   } catch  (e) {

   }
}

/*
 * Been having trouble getting this to work in prod, but heres what you do:
 * delete all the winners in the winners document in firebase, but LEAVE TEH DATA ARRAY empty
 * then delete the votes collect//ion entirely
 * and the entire thing is reset and good to go
 */
const on_vote_reset = async(req, res) => {
   try {
      const request = {
         secret: req.body.secret,
         author: users[req.body.secret],
      }

      if (request.author === undefined) return res.status(400).json({ message: "Invalid Secret"})
      if (request.author !== "chiyeon") return res.status(400).json({ message: "You aren't admin!"})

      end_time = 0

      firebase.delete_doc_path("beatbattle/winners")
      firebase.delete_collection("votes")

      return res.status(200).json({ message: "reset complete!" })
   } catch  (e) {

   }
}

const get_winners = async (req, res) => {
   let winners = (await firebase.get_doc_path("beatbattle/winners"))

   res.json({
      "winners": winners ? winners.data : []
   })
}

const get_tracks = async(req, res) => {
   if (end_time != null) {
      if (end_time < Date.now()) set_winners()

      res.json({
         tracks
      })
   } else {
      res.json({
         tracks: []
      })
   }
}

const start = (port) => {
   server.listen(port, async () => {
      print("Voting server started on port " + port)

      tracks = (await firebase.get_doc_path("beatbattle/tracks")).data
      users = await firebase.get_doc_path("beatbattle/users")

      if (!users || !tracks) return print("ERROR: Users/Tracks could not be loaded! (Firebase may not be connected)")
      
      if (end_time && Date.now() < end_time) print("Voting is still going!")
   })
}

app.use(cors({ origin: [process.env.CLIENT_IP] }))
app.use(body_parser.json())

app.post("/vote", on_vote)
app.post("/start", on_vote_start)
app.post("/reset", on_vote_reset)

app.get("/winners", get_winners)
app.get("/tracks", get_tracks)
app.get("/time", async (req, res) => { res.json({ time: end_time }) })

module.exports = {
   start: start
}
