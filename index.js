// ----- ----- ----- ----- ----- ----- ----- Setup ----- ----- ----- ----- ----- ----- -----
const express = require('express')
const bodyParser = require('body-parser')
const uniqid = require('uniqid')
const _ = require('lodash')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors({
    origin: "*"
}))

const port = 3500

// ----- ----- ----- ----- ----- ----- ----- Database ----- ----- ----- ----- ----- ----- -----
//Volatile database. Will be cleared every time the server restarts

/*
{
    id: an unique id
    name: name of the audience
    message: message
}
*/
let audiences = []

/*
{
    audienceId: the audience id (who sent the message)
    message: the message
}
Messages will be stored in the array until it is read by Unity. Then it will be removed.
*/
let messages = []

/*
{
    audienceId: the audience id (who sent the emote)
    emoteType: type of the emoji
}
Emotes will be stored in the array until it is read by Unity. Then it will be removed.
*/
let emotes = []

// ----- ----- ----- ----- ----- ----- ----- API ----- ----- ----- ----- ----- ----- -----

// GET "/audiences"
// Return all audiences
app.get('/audiences', (req, res) => {
    let mergedAudiences = audiences.map(audience => {
        return {
            id: audience.id,
            name: audience.name,
            messages: messages.filter(message => message.audienceId == audience.id)
        }
    })

    res.send({
        data: mergedAudiences
    })
})

// GET "/audiences/:audienceId"
// Get a single audience
app.get("/audiences/:audienceId", (req, res) => {
    let audienceId = req.params.audienceId

    const found = audiences.find(audience => audience.id == audienceId)

    let result = {}
    if (found) {
        found.messages = messages.filter(message => message.audienceId == audienceId)
        
        result.message = "OK"
        result.data = found
    }
    else {
        result.message = "Not found"
        result.data = null
    }

    res.send(result)
})


// POST "/audiences"
// Post a new audience
// Send data as JSON
app.post("/audiences", (req, res) => {
    if (!req.body.name || req.body.name == "") {
        res
        .status(400)
        .send({
            message: "Name should be specified"
        })
            
        return
    }

    let newAudience = {
        id: uniqid("audience-"),
        name: req.body.name
    }

    audiences.push(newAudience)

    res.send({
        message: "OK",
        data: newAudience
    })
})

app.delete("/audiences", (req, res) => {
    if (!req.query.id) {
        audiences = []
        messages = []

        res.send({
            message: "OK",
            data: {
                audiences: audiences,
                messages: messages
            }
        })

        return
    }
    else {
        let audienceToDelete = audiences.find(audience => audience.id == req.query.id)
    
        if (!audienceToDelete) {
            res.send({
                message: "Audience not found"
            })
    
            return
        }
    
        _.remove(audiences, audience => {
            return audience.id == req.query.id
        })
    
        _.remove(messages, message => {
            return message.audienceId == req.query.id
        })
    
        res.send({
            message: "OK",
            data: audienceToDelete
        })
    }

})


// POST "/messages"
// Send new message
// Send data as JSON
app.post("/messages", (req, res) => {
    if (!req.body.audienceId || req.body.audienceId == "") {
        res
        .status(400)
        .send({
            message: "audienceId is required and cannot be an empty string"
        })
            
        return
    }

    let audience = audiences.find(audience => audience.id == req.body.audienceId)

    if (!audience) {
        res
        .status(404)
        .send({
            message: "Audience not found!"
        })
        return
    }

    if (!req.body.message || req.body.message == "") {
        res
        .status(400)
        .send({
            message: "message is required and cannot be an empty string"
        })
            
        return
    }

    let audienceId = req.body.audienceId
    audiences

    let newMessage = {
        id: uniqid("message-"),
        audienceId: audienceId,
        message: req.body.message
    }

    messages.push(newMessage)

    res.send({
        message: "OK",
        data: newMessage
    })
})


app.delete("/messages", (req, res) => {
    if (!req.query.id || req.query.id == "") {
        res
        .status(400)
        .send({
            message: "Query id is required"
        })
        return
    }

    let messageToDelete = messages.find(message => message.id == req.query.id)
    
    if (!messageToDelete) {
        res.send({
            message: "Message not found"
        })
        return
    }

    _.remove(messages, message => {
        return message.id == req.query.id
    })

    res.send({
        message: "OK",
        data: messageToDelete
    })
})


// POST "/messages"
// Get and delete all messages
app.get("/messages", (req, res) => {
    res.send({
        message: "OK",
        data: messages
    })
})


app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})