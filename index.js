const express = require('express')
const app = express()
const port = 3500

app.get('/', (req,res) => {
    res.send("Hello world")
})

app.listen(process.env.PORT || 3500, () => {
    console.log(`Example app listening on port ${port}`)
})