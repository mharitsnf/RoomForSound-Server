
const _ = require("lodash")
const { WebSocket } = require("ws")

// [{sessonId:[connectionId,...]}]
const clients = new Map()

// [{connectionId:[sessionId1, sessionId2]}]
const connectionPair = new Map()

function addClient(ws) {
    clients.set(ws, new Set())
}

function removeClient(ws) {
    const connectionIds = clients.get(ws);
    connectionIds.forEach(connectionId => {
        const pair = connectionPair.get(connectionId)
        if (pair) {
            const otherSessionWs = pair[0] == ws ? pair[1] : pair[0]
            if (otherSessionWs) {
                otherSessionWs.send(JSON.stringify({ type: "disconnect", connectionId: connectionId }))
            }
        }
        connectionPair.delete(connectionId);
    });

    clients.delete(ws)
}

function getOrCreateConnectionIds(session) {
    let connectionIds = null;
    if (!clients.has(session)) {
        connectionIds = new Set();
        clients.set(session, connectionIds);
    }
    connectionIds = clients.get(session);
    return connectionIds;
}

function onConnect(ws, connectionId) {
    let polite = true

    const connectionIds = getOrCreateConnectionIds(ws);
    connectionIds.add(connectionId);
    ws.emit("serverConnect", { connectionId: connectionId, polite: polite })
}

module.exports = {
    addClient: addClient,
    removeClient: removeClient,
    onConnect: onConnect
}