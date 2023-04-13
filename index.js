const express = require('express')
const fs = require('fs')
var morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', function getBody(req){
    //if statement to clean {} from morgan output 
    if(JSON.stringify(req.body) !== '{}'){
        return JSON.stringify(req.body)
    }
    else{
        return ' '
    }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
let people = JSON.parse(fs.readFileSync('./db.json', 'utf8'))
console.log(people)

const generateId = () => {
    const newId = Math.round(Math.random()*(5000))
    console.log(`Generated id ${newId}`)    
    if(people.find(person => person.id === newId)){
        console.log(`Id ${newId} is already taken, creating new`)
        generateId()
    }
    return newId
}

app.get('/api/persons',(req, res) => {
    console.log('Getting all people')
    Person.find({}).then(people => {
        res.json(people)
    })
})

app.get('/info',(req, res) => {
    let numberOfPeople = 0
    Person.find({}).then(people => {
        numberOfPeople = people.length
        const timestamp = new Date(Date.now())
        console.log(timestamp) 
        const html = `
            <p>Phonebook has info of ${numberOfPeople} people. <p>
            <p>${timestamp.toLocaleString()}<p>
        `
        res.send(html)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if(person){
        res.json(person)
        }
        else{response.status(404).end()}
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
   Person.findByIdAndRemove(req.params.id)
    .then(person => {
        console.log(`Deleting ${person.name}`)
        res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if(!body.name || !body.number){
        const errorMessage = 'provide name and number' 
        console.log(errorMessage)
        return res.status(400).json({    
            error: errorMessage
        })
    }
    Person.find({name: body.name}).then(people => {
        if (people.length > 0) {
          const errorMessage = `${body.name} is already added`;
          console.log(errorMessage);
          return res.status(400).json({ error: errorMessage });
        } else {
          const person = new Person({
            name: body.name,
            number: body.number,
          });
          console.log(`Person created: ${person}`);
          person.save().then(savedPerson => {
            res.json(savedPerson);
          })
          .catch(error => next(error))
        }
      })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, { new:true })
    .then(updatedPerson => {
        res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(error => error.message);
        return response.status(400).json({ error: errorMessages });
      }
      
    next(error)
  }
  app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})

