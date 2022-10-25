// ----- ----- ----- ----- ----- ----- ----- Setup ----- ----- ----- ----- ----- ----- -----
const { createServer } = require("./server")
const { createWebSocketServer } = require("./websocket")
const port = 3500

// Express
let expressApp = createServer()
let expressServer = expressApp.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})

// Websocket
createWebSocketServer(expressServer, "public")
