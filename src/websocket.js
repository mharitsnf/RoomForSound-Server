const websocket = require("ws")

let wss

const createWebSocketServer = (server) => {
    wss = new websocket.Server({ server })

    wss.on("connection", ws => {
        ws.on("message", message => console.log(message))
    })
    
    return wss
}

module.exports = {
    getServer: wss,
    createWebSocketServer: createWebSocketServer
}