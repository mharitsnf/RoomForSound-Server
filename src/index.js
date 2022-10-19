// ----- ----- ----- ----- ----- ----- ----- Setup ----- ----- ----- ----- ----- ----- -----
const { createServer } = require("./server")
const port = 3500

const expressApp = createServer()

expressApp.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})