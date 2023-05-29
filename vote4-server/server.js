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
var end_time = 0
var start_time = 0
const firebase = require("./firebase.js")
// we cache a copy of events to make it quick to load
// on the listen page. is updated whenever the firebase updates.
// we also hold onto users.
// both of these will dynamically update with the firebase
var users, events, tracks, current_event_id


/*
 * FUNCTIONS
 */

/*
 * retrieves all votes saved in firebase & calculates scoreboard, putting it
 * in beatbattle/winners/data 
 */
const set_winners = async () => {
   end_time = 0
   start_time = 0
   let votes = await firebase.get_collection("votes")

   if (!votes) return;

   let processed_votes = {}
   for (let i = 0; i < tracks.length; ++i) processed_votes[i] = 0

   Object.keys(votes).forEach(vote_author => {
      processed_votes[votes[vote_author].target]++;
   })

   let winners = Object.keys(processed_votes).map(
      (_key) => {
         let key = parseInt(_key)

         return {
            "artist": tracks[key].artist,
            "title": tracks[key].title,
            "winner": false,
            "votes": processed_votes[_key],
            "totalVotes": Object.keys(votes).length,
            "index": key
         }
      }
   )

   winners.sort((a, b) => b.votes - a.votes)

   let winning_vote = winners[0].votes
   let new_tracks = [...tracks]

   winners.forEach(winner => {
      if (winner.votes >= winning_vote) {
         winner.winner = true
         new_tracks[winner.index].winner = true;
      }
   })

   // update winners in firebase db
   firebase.update_doc("events", current_event_id, {
      tracks: new_tracks
   })

   await firebase.set_doc_path("beatbattle/winners", {
      data: winners
   })

   print("Vote has concluded!")
}

const on_vote = async (req, res) => {
   try {
      let events_values = Object.values(events)
      let tracks = events_values[events_values.length - 1].tracks

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
         minutes: req.body.minutes
      }

      if (request.author === undefined) return res.status(400).json({ message: "Invalid Secret"})
      if (request.author !== "chiyeon") return res.status(400).json({ message: "You aren't admin!"})
      if (request.minutes === undefined || request.minutes === 0) return res.status(400).json({ message: "Input a Vote Duration (minutes)!"})

      print("The vote is starting!")
      start_time = Date.now()
      end_time = start_time + (1000 * 60 * request.minutes)

      return res.status(200).json({ message: "Vote started!" })
   } catch  (e) {
      print(e)
   }
}

const on_new_event = async (req, res) => {
   try {
      const request = {
         secret: req.body.secret,
         author: users[req.body.secret],
         event: req.body.event
      }

      if (request.author === undefined) return res.status(400).json({ message: "Invalid Secret"})
      if (request.author !== "chiyeon") return res.status(400).json({ message: "You aren't admin!"})

      if (request.event.title == "") return res.status(400).json({ message: "Title is empty!" })
      if (request.event.date == "") return res.status(400).json({ message: "Date is empty!" })
      if (request.event.tracks.length == 0) return res.status(400).json({ message: "No track data!" })

      let events_length = Object.keys(events).length
      await firebase.set_doc("events", events_length.toString(), request.event)

      return res.status(200).json({ message: "Event Uploaded!" })
   } catch  (e) {
      print(e)
   }
}

/* BELOW IS NOT TRUE ANYMORE. SAVING JUST IN CASE
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

      await firebase.delete_doc_path("beatbattle/winners")
      await firebase.delete_collection("votes")

      print("Vote reset!")

      return res.status(200).json({ message: "Reset Complete!" })
   } catch  (e) {
      print(e)
   }
}

const get_winners = async (req, res) => {
   let winners = (await firebase.get_doc_path("beatbattle/winners"))

   res.json({
      "winners": winners ? winners.data : []
   })
}

const get_tracks = async(req, res) => {
   if (end_time != null && end_time != 0) {
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

const get_events = async(req, res) => {
   let events_values = Object.values(events)

   res.json({
      events: events_values
   })
}

const start = (port) => {
   server.listen(port, async () => {
      
      // keeps our cached events up to date with current version on db
      firebase.setup_collection_listener("events", (_events) => {
         events = _events

         let events_values = Object.values(events)
         tracks = events_values[events_values.length - 1].tracks
         current_event_id = (events_values.length - 1).toString()

         print("Pulled latest 'events' from db")
      })
      print("Listening for changes in events collection")

      // keep users up to date
      firebase.setup_document_listener_path("beatbattle/users", (_users) => {
         users = _users
         print("Pulled latest 'users' from db")
      })
      print("Listening for changes in users document")


      print("Voting server started on port " + port)
      if (end_time && Date.now() < end_time) print("Voting is still going!")
   })
}

// setup web server
app.use(cors({ origin: [process.env.CLIENT_IP] }))
app.use(body_parser.json())

app.post("/vote", on_vote)
app.post("/start", on_vote_start)
app.post("/reset", on_vote_reset)
app.post("/new-event", on_new_event)

app.get("/winners", get_winners)
app.get("/tracks", get_tracks)
app.get("/events", get_events)
app.get("/time", async (req, res) => { res.json({ time: end_time }) })
app.get("/time-now", async (req, res) => { res.json({ time: Date.now() })})

module.exports = {
   start: start
}
