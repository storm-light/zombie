const buttonA = document.querySelector("#button_A");
const start = document.getElementById("start");
const textbox = document.getElementById("name");
const headingA = document.querySelector("#heading_A");


var started = false;
var ws;
var myname;

textbox
    .addEventListener("keyup", function(event) {
    event.preventDefault();
        if (event.keyCode === 13) {
        buttonA.click();
    }
    });

buttonA.onclick = async () => {
    
    // TODO: when someone presses the Start button, one person is assigned Infected and all others are Human
    // rn I am sending all names through one origin (localhost8080), so do names need to be linked to origin (rn differentiated by port)?

    // if the game has already started, then new players cannot join
    
    let name = document.getElementById("name");
    alert("You have joined the lobby");

    const bodyobj = { event: "join", name: textbox.value, port: location.port };
    myname = textbox.value;
    
    const response = await fetch("http://localhost:3000", {
        method: 'POST',
        body: JSON.stringify(bodyobj)
    });
    
    document.getElementById("label").remove();
    textbox.remove();
    buttonA.remove();
    
    checkGameStatus();
    // const response = await fetch("http://localhost:3000");
    // headingA.textContent = `You got a ` + number.resolve().toString();

    headingA.textContent = await response.text();
    
    // TODO: create a WebSocket that waits for server to say someone started the game
    // why can't we just create a separate websocket server just for syncing game start?
    // const socket = new WebSocket("https://localhost:3000")
    
    ws = new WebSocket('ws://localhost:3001/');
    
    ws.onopen = function open() {
	    // ws.send('Hello from port ' + location.port.toString());
    };

    ws.onerror = function(error) {
	    console.log(error);
    };
    
    ws.onmessage = function(event) {
	    // console.log('Server said: ' + event.data);	// print the message
        if (event.data = 'start') {
            console.log("received start game signal, game starting...");
            started = true;
            start.click();
        }
    };
};

start.onclick = async () => {
    
    const obj = {event: "retrieve_players", port: location.port};
    const respons = await fetch("http://localhost:3000", {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    
    const object = {event: "start", port: location.port};
    const response = await fetch("http://localhost:3000", {
        method: 'POST',
        body: JSON.stringify(object)
    });
    // location.assign("http://localhost:" + location.port + "/lobby.html");
    // TODO: send "game started" ping to websocket server
    if (started == false) {
        ws.send("start");
        started = true;
    }
    
    // clear elements from current page
    document.body.innerHTML = "";

    // // create lobby page elements
    const para = document.createElement("p");
    para.id = "p";
    para.appendChild(document.createTextNode("Lobby:"));
    document.body.appendChild(para);
    
    // TODO: receive list of players (and infected status) from server
    //       then add player names as text to document body
    const res = await respons.json();
    var p = document.getElementById("p");
    for (let i = 0; i < res.players.length; i++) {
        p.appendChild(document.createElement("br"));
        if (res.players[i] == myname) {
            const bold = document.createElement("strong"); 
            bold.appendChild(document.createTextNode(res.players[i]));
            p.appendChild(bold);
        } else {
            p.appendChild(document.createTextNode(res.players[i]));
        }
        if (i == res.infected) {
            p.appendChild(document.createTextNode("*"));
        }
    }
}

async function checkGameStatus() {
    const obj = {event: "check_status", port: location.port};
    const respons = await fetch("http://localhost:3000", {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    
    const res = await respons.text();
    console.log(res);
    if (res == "true") {
        started = true;
        start.click();
    }
}

window.onload = checkGameStatus;
