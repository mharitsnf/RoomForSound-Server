const websocket = require("ws")

let wss

const createWebSocketServer = (server) => {
    wss = new websocket.Server({ server })

    wss.on("connection", ws => {
        ws.on("message", (message, isBinary) => {
            let msg = isBinary ? message : JSON.parse(message.toString())
            console.log(msg)
            ws.send(JSON.stringify({ message: "hello" }))
        })
    })
    
    return wss
}

module.exports = {
    getServer: wss,
    createWebSocketServer: createWebSocketServer
}