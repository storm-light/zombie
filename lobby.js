async function populateNames() {
    const object = {event: "retrieve_players", port: location.port};
    const response = await fetch("http://localhost:3000", {
        method: 'POST',
        body: JSON.stringify(object)
    });
    // TODO: receive list of players (and infected status) from server
    //       then add player names as text to document body
    const res = await response.json();
    var p = document.getElementById("p");
    for (let i = 0; i < res.players.length; i++) {
        p.appendChild(document.createElement("br"));
        p.appendChild(document.createTextNode(res.players[i]));
        if (i == res.infected) {
            p.appendChild(document.createTextNode("*"));
        }
    }
}

window.onload = populateNames;
