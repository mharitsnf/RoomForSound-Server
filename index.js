const express = require('express')
const bodyParser = require('body-parser')
const uniqid = require('uniqid')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const port = 3500

/*
The volatile database, if you will
{
    id: an unique id
    name: name of the audience
}
*/
let audiences = []

// GET "/audiences"
// Return all audiences
app.get('/audiences', (req, res) => {
    res.send({
        message: "OK",
        data: audiences
    })
})

// GET "/audiences/:audienceId"
// Get a single audience
app.get("/audiences/:audienceId", (req, res) => {
    let id = req.params.audienceId

    const found = audiences.find(audience => audience.id == id)

    let result = {}
    if (found) result.message = "OK"
    else result.message = "Not found"
    
    result.data = found

    res.send(result)
})


// POST "/audiences"
// Post a new audience
// Send data as JSON
app.post("/audiences", (req, res) => {
    let newAudience = {
        id: uniqid(),
        name: req.body.name
    }

    audiences.push(newAudience)

    res.send({
        message: "OK",
        data: newAudience
    })
})


app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})