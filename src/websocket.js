const handler = require("./handler")
const { Server } = require("socket.io")

let io

const createWebSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.on('connection', (socket) => {

        console.log("Connection opened")

        socket.on("disconnect", () => {
            console.log("Disconnected")
            socket.emit("message", { message: "bye client!" })
        })

        socket.on("message", msg => {
            console.log("Message from client: ", msg)
        })

        socket.on("serverConnect", msg => {
            console.log("ServerConnect event: ", msg)
            handler.onConnect(socket, msg.connectionId)
        })

        socket.on("serverDisconnect", msg => {
            console.log("ServerDisconnect event: ", msg)
        })

        socket.on("offer", msg => {
            console.log("Offer event: ", msg)
        })
    })

    return io
}

module.exports = {
    getServer: io,
    createWebSocketServer: createWebSocketServer
}