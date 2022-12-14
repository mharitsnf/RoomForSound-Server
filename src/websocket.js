const handler = require("./handler")
const { WebSocketServer } = require("ws")
const { Server } = require("socket.io")

let ws

const createWebSocketServer = (server, mode) => {

    ws = new WebSocketServer({ server })

    handler.reset(mode)

    ws.on("connection", (socket) => {
        handler.add(socket)

        socket.on("close", () => {
            handler.remove(socket)
        })

        socket.on("message", (message, isBinary) => {
            const msg = isBinary ? message : JSON.parse(message.toString())
            if (!msg) return

            console.log(msg)

            switch (msg.type) {
                case "connect":
                    handler.onConnect(socket, msg.connectionId);
                    break
                case "disconnect":
                    handler.onDisconnect(socket, msg.connectionId);
                    break
                case "offer":
                    handler.onOffer(socket, msg.data);
                    break
                case "answer":
                    handler.onAnswer(socket, msg.data);
                    break
                case "candidate":
                    handler.onCandidate(socket, msg.data);
                    break
                default:
                    break
            }
        })
    })

    return ws
}

module.exports = {
    getServer: ws,
    createWebSocketServer: createWebSocketServer
}


// Old createwebsocketserver
// const createWebSocketServer = (server) => {

//     ws = new WebSocket(server)

    

//     // io = new Server(server, {
//     //     cors: {
//     //         origin: "*"
//     //     }
//     // })

//     // io.on('connection', (socket) => {

//     //     console.log("Connection opened")

//     //     socket.on("disconnect", () => {
//     //         console.log("Disconnected")
//     //     })

//     //     socket.on("message", msg => {
//     //         console.log("Message from client: ", msg)
//     //     })

//     //     socket.on("serverConnect", msg => {
//     //         console.log("ServerConnect event: ", msg)
//     //         handler.onConnect(socket, msg.connectionId)
//     //     })

//     //     socket.on("serverDisconnect", msg => {
//     //         console.log("ServerDisconnect event: ", msg)
//     //     })

//     //     socket.on("offer", msg => {
//     //         console.log("Offer event: ", msg)
//     //     })
//     // })

//     return io
// }