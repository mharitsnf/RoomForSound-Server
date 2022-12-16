const { Offer } = require("./offer")
const { Answer } = require("./answer")
const { Candidate } = require("./candidate")

let isPrivate = false

// [{sessonId:[connectionId,...]}]
const clients = new Map();

// [{connectionId:[sessionId1, sessionId2]}]
const connectionPair = new Map();

// [{connectionId:Offer}]
const offers = new Map();

// [{connectionId:Answer}]
const answers = new Map();

// [{sessionId:[{connectionId:Candidate},...]}]
const candidates = new Map();

function getOrCreateConnectionIds(settion) {
    let connectionIds = null;
    if (!clients.has(settion)) {
        connectionIds = new Set();
        clients.set(settion, connectionIds);
    }
    connectionIds = clients.get(settion);
    return connectionIds;
}

function reset(mode) {
    isPrivate = mode == "private";
}

function onConnect(ws, connectionId) {
    let peerExists = false;
    if (this.isPrivate) {
        if (connectionPair.has(connectionId)) {
            const pair = connectionPair.get(connectionId);

            if (pair[0] != null && pair[1] != null) {
                ws.send(JSON.stringify({ type: "error", message: `${connectionId}: This connection id is already used.` }));
                return;
            } else if (pair[0] != null) {
                connectionPair.set(connectionId, [pair[0], ws]);
                peerExists = true;
            }
        } else {
            connectionPair.set(connectionId, [ws, null]);
        }
    }

    const connectionIds = getOrCreateConnectionIds(ws);
    connectionIds.add(connectionId);
    ws.send(JSON.stringify({ type: "connect", connectionId: connectionId, peerExists: peerExists }));
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
}

function onOffer(ws, message) {
    const connectionId = message.connectionId;
    const newOffer = new Offer(message.sdp, Date.now());
    offers.set(connectionId, newOffer);

    if (this.isPrivate) {
        const pair = connectionPair.get(connectionId);
        const otherSessionWs = pair[0] == ws ? pair[1] : pair[0];
        if (otherSessionWs) {
            otherSessionWs.send(JSON.stringify({ from: connectionId, to: "", type: "offer", data: newOffer }));
        } else {
            ws.send(JSON.stringify({ type: "error", message: `${connectionId}: This connection id is not ready other session.` }));
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
    answers.set(connectionId, newAnswer);

    let otherSessionWs = null;

    if (this.isPrivate) {
        const pair = connectionPair.get(connectionId);
        otherSessionWs = pair[0] == ws ? pair[1] : pair[0];
    } else {
        const pair = connectionPair.get(connectionId);
        otherSessionWs = pair[0];
        connectionPair.set(connectionId, [otherSessionWs, ws]);
    }

    const mapCandidates = candidates.get(otherSessionWs);
    if (mapCandidates) {
        const arrayCandidates = mapCandidates.get(connectionId);
        for (const candidate of arrayCandidates) {
            candidate.datetime = Date.now();
        }
    }

    if (this.isPrivate) {
        otherSessionWs.send(JSON.stringify({ from: connectionId, to: "", type: "answer", data: newAnswer }));
        return;
    }

    clients.forEach((_v, k) => {
        if (k == ws) {
            return;
        }
        k.send(JSON.stringify({ from: connectionId, to: "", type: "answer", data: newAnswer }));
    });
}

function onCandidate(ws, message) {
    const connectionId = message.connectionId;

    if (!candidates.has(ws)) {
        candidates.set(ws, new Map());
    }
    const map = candidates.get(ws);
    if (!map.has(connectionId)) {
        map.set(connectionId, []);
    }
    const arr = map.get(connectionId);
    const candidate = new Candidate(message.candidate, message.sdpMLineIndex, message.sdpMid, Date.now());
    arr.push(candidate);

    if (this.isPrivate) {
        const pair = connectionPair.get(connectionId);
        const otherSessionWs = pair[0] == ws ? pair[1] : pair[0];
        if (otherSessionWs) {
            otherSessionWs.send(JSON.stringify({ from: connectionId, to: "", type: "candidate", data: candidate }));
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
    onConnect: onConnect,
    onDisconnect: onDisconnect,
    onOffer: onOffer,
    onAnswer: onAnswer,
    onCandidate: onCandidate,
    clients: clients,
    connectionPair: connectionPair,
    offers: offers,
    answers: answers,
    candidates: candidates,
    reset: reset
}