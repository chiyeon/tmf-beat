# tmf-beat
Website &amp; Voting Server for That My Favorite Beat 24/48 Hour Beat Challenge!

### beatbattle-www
The static website runs on React and communicates with the voting server for all voting purposes. All other data is **hard coded into the client**, something that--with better hosting options--should be changed in the future.

### vote4-server
The voting server is deployed with free hosting options, and may take a few moments to start up as a result. The server handles processing votes, determining winners, and storing data. The express web server processes and handles requests from clients, verifying and checking all before making changes. 
