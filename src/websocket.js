const handler = require("./handler")
const { WebSocketServer } = require("ws")
const { Server } = require("socket.io")

let ws

const createWebSocketServer = (server) => {

    ws = new WebSocketServer({ server })

    ws.on("connection", (socket) => {
        handler.addClient(socket)

        console.log("Client connected")
        socket.send(JSON.stringify({ message: "Hello from server! "}))

        socket.on("close", () => {
            handler.removeClient(socket)
            console.log("Client disconnected")
            socket.send(JSON.stringify({ message: "Goodbye from server! "}))
        })

        socket.on("message", (message, isBinary) => {
            const msg = isBinary ? message : JSON.parse(message.toString())
            if (!msg) return

            console.log(msg)

            switch (msg.type) {
                case "connect":
                    console.log("receive connect event")
                    handler.onConnect(socket, msg.connectionId);
                    break
                case "disconnect":
                    // handler.onDisconnect(ws, msg.connectionId);
                    break
                case "offer":
                    // handler.onOffer(ws, msg.data);
                    break
                case "answer":
                    // handler.onAnswer(ws, msg.data);
                    break
                case "candidate":
                    // handler.onCandidate(ws, msg.data);
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