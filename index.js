const express = require('express')
const fs = require('fs')
var morgan = require('morgan')
const app = express()
const cors = require('cors')

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
    res.json(people)
})

app.get('/info',(req, res) => {
    console.log(`people.size${people.length}`)
    const timestamp = new Date(Date.now())
    console.log(timestamp) 
    const html = `
        <p>Phonebook has info of ${people.length} people. <p>
        <p>${timestamp.toLocaleString()}<p>
    `
    res.send(html)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = people.find(person => person.id === id)

    if(person){
        res.json(person)
    }
    else{
        res.send(`Person with id: ${id} not found`)
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    people = people.filter(person => person.id !== id)

    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if(!body.name || !body.number){
        const errorMessage = 'provide name and number' 
        console.log(errorMessage)
        return res.status(400).json({    
            error: errorMessage
        })
    }
    if(people.find(person => person.name === body.name)){
        const errorMessage = `${body.name} is already added`
        console.log(errorMessage)
        return res.status(400).json({
            error: errorMessage
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    console.log(`Person created: ${person}`)
    people = people.concat(person)
    console.log(people)
    res.json(person)

})
const PORT = process.env.PORT || 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})

