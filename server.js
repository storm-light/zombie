const { createServer } = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

var players = [];
var origins = [];
var playerlist = "";
var started = false;
var first;

const server = createServer((req, res) => {
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    // res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
    
    const { headers, method, url } = req;
    var json = {};
    let body = [];
    req
      .on('error', err => {
          console.error(err);
      })
        .on('data', chunk => {
          body.push(chunk);
      })
      .on('end', () => {
          body = Buffer.concat(body).toString();
          json = JSON.parse(body);
          if (json.hasOwnProperty("event")) {
              console.log(json.event);
              if (json.event == 'start') {
                  console.log("Game Started");
                  started = true;
                  res.end('');
              } else if (json.event == 'join') {
                  let player = json.name;
                  let result = client.query('INSERT INTO players (name) VALUES ($1);', [player]). then((result) => {console.log(result); return result;}) .catch((err) => {console.error('Error with query:', err); });
                  let port = json.port;
                  players.push(player);
                  origins.push(port)
                  console.log(player + ' joined the fray from ' + port);
                  let playerstring = "Lobby: ";
                  for (let i = 0; i < players.length; i++) {
                      playerstring += players[i] + ', ';
                  }
                  playerstring = playerstring.substring(0, playerstring.length-2);
                  console.log(playerstring);
                  
                  res.end("Waiting For Game To Start...");
                  // TODO: maybe go immediately to lobby upon joining so that a player cannot enter multiple usernames
              }
              if (json.event == 'retrieve_players') {
                  let result = client.query({rowMode:'array', text:'SELECT name FROM players ORDER BY name;'})
                      .then((result) => {
                          res.setHeader('Content-Type', 'application/json');
                          // TODO: pick someone randomly to start infection (only once)
                          if (started == false) {
                              first = Math.floor(Math.random() * result.rows.length);
                          }
                          res.end(JSON.stringify({players: result.rows, infected: first}));
                          console.log(result);})
                      .catch((err) => {console.error('Error with query retrieving players:', err); });
              }
              if (json.event == 'check_status') {
                  res.end(started.toString());
              }
          }
      });

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const { Client } = require('pg');
 
const client = new Client({ user: 'postgres', host: 'localhost', database: 'mydb', password: 'plant', port: '5432', });
 
client.connect() .then(() => { console.log('Connected to PostgreSQL database!'); }) .catch((err) => { console.error('Error connecting to the database:', err); });

let result = client.query('DROP TABLE IF EXISTS players; CREATE TABLE players (name VARCHAR);'). then((result) => {console.log(result); return result;}) .catch((err) => {console.error('Error with query:', err); });
