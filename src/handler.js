const { Offer } = require("./offer")
const { Answer } = require("./answer")
const { Candidate } = require("./candidate")

let isPrivate = false

// [{sessonId:[connectionId,...]}]
const clients = new Map()

// [{connectionId:[sessionId1, sessionId2]}]
const connectionPair = new Map()

function getOrCreateConnectionIds(session) {
    let connectionIds = null;
    if (!clients.has(session)) {
        connectionIds = new Set();
        clients.set(session, connectionIds);
    }
    connectionIds = clients.get(session);
    return connectionIds;
}

function reset(mode) {
    isPrivate = mode == "private";
}

function add(ws) {
    clients.set(ws, new Set());
}

function remove(ws) {
    const connectionIds = clients.get(ws);
    connectionIds.forEach(connectionId => {
        const pair = connectionPair.get(connectionId);
        if (pair) {
            const otherSessionWs = pair[0] == ws ? pair[1] : pair[0];
            if (otherSessionWs) {
                otherSessionWs.send(JSON.stringify({ type: "disconnect", connectionId: connectionId }));
            }
        }
        connectionPair.delete(connectionId);
    });

    clients.delete(ws);
}

function onConnect(ws, connectionId) {
    let polite = true
    if (isPrivate) {
        if (connectionPair.has(connectionId)) {
            const pair = connectionPair.get(connectionId);

            if (pair[0] != null && pair[1] != null) {
                ws.send(JSON.stringify({ type: "error", message: `${connectionId}: This connection id is already used.` }));
                return;
            } else if (pair[0] != null) {
                connectionPair.set(connectionId, [pair[0], ws]);
            }
        } else {
            connectionPair.set(connectionId, [ws, null]);
            polite = false;
        }
    }

    const connectionIds = getOrCreateConnectionIds(ws);
    connectionIds.add(connectionId);
    ws.send(JSON.stringify({ type: "connect", connectionId: connectionId, polite: polite }))
}

function onDisconnect(ws, connectionId) {
    const connectionIds = clients.get(ws);
    connectionIds.delete(connectionId);

    if (connectionPair.has(connectionId)) {
        const pair = connectionPair.get(connectionId);
        const otherSessionWs = pair[0] == ws ? pair[1] : pair[0];
        if (otherSessionWs) {
            otherSessionWs.send(JSON.stringify({ type: "disconnect", connectionId: connectionId }));
        }
    }
    connectionPair.delete(connectionId);
    ws.send(JSON.stringify({ type: "disconnect", connectionId: connectionId }));
}

function onOffer(ws, message) {
    console.log(clients.has(ws))
    const connectionId = message.connectionId;
    const newOffer = new Offer(message.sdp, Date.now(), false);

    if (isPrivate) {
        if (connectionPair.has(connectionId)) {
            const pair = connectionPair.get(connectionId);
            const otherSessionWs = pair[0] == ws ? pair[1] : pair[0];
            if (otherSessionWs) {
                newOffer.polite = true;
                otherSessionWs.send(JSON.stringify({ from: connectionId, to: "", type: "offer", data: newOffer }));
            }
        }
        return;
    }

    connectionPair.set(connectionId, [ws, null]);
    clients.forEach((_v, k) => {
        if (k == ws) {
            return;
        }
        k.send(JSON.stringify({ from: connectionId, to: "", type: "offer", data: newOffer }));
    });
}

function onAnswer(ws, message) {
    const connectionId = message.connectionId;
    const connectionIds = getOrCreateConnectionIds(ws);
    connectionIds.add(connectionId);
    const newAnswer = new Answer(message.sdp, Date.now());

    if (!connectionPair.has(connectionId)) {
        return;
    }

    const pair = connectionPair.get(connectionId);
    const otherSessionWs = pair[0] == ws ? pair[1] : pair[0];

    if (!isPrivate) {
        connectionPair.set(connectionId, [otherSessionWs, ws]);
    }

    otherSessionWs.send(JSON.stringify({ from: connectionId, to: "", type: "answer", data: newAnswer }));
}

function onCandidate(ws, message) {
    const connectionId = message.connectionId;
    const candidate = new Candidate(message.candidate, message.sdpMLineIndex, message.sdpMid, Date.now());

    if (isPrivate) {
        if (connectionPair.has(connectionId)) {
            const pair = connectionPair.get(connectionId);
            const otherSessionWs = pair[0] == ws ? pair[1] : pair[0];
            if (otherSessionWs) {
                otherSessionWs.send(JSON.stringify({ from: connectionId, to: "", type: "candidate", data: candidate }));
            }
        }
        return;
    }

    clients.forEach((_v, k) => {
        if (k === ws) {
            return;
        }
        k.send(JSON.stringify({ from: connectionId, to: "", type: "candidate", data: candidate }));
    });
}

module.exports = {
    reset: reset,
    add: add,
    remove: remove,
    onConnect: onConnect,
    onDisconnect: onDisconnect,
    onOffer: onOffer,
    onAnswer: onAnswer,
    onCandidate: onCandidate
}