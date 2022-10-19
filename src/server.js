const express = require("express")
const bodyParser = require("body-parser")
const uniqid = require("uniqid")
const _ = require("lodash")
const cors = require("cors")

// Database
let audiences = []
let messages = []

const createServer = () => {

    // Express initialization
    const app = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(cors({
        origin: "*"
    }))

    // API
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
            result.message = "Audience not found"
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
                    message: "Name cannot be empty!"
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
                    message: "Audience not found! Redirecting to home page."
                })
            return
        }

        if (!req.body.message || req.body.message == "") {
            res
                .status(400)
                .send({
                    message: "Message cannot be an empty!"
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

    app.get("/error", (req, res) => {
        res
            .status(400)
            .send({
                message: "Error testing"
            })
    })

    return app
}

module.exports = {
    createServer: createServer
}