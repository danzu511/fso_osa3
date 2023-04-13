const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const numberValidator = (num) => {
  let myBool = false
  if (num.charAt(2) === '-' || num.charAt(3) === '-') {
    const numArr = num.split('-')
    if (numArr.length === 2) {
      // check if it contains only numbers
      if (!isNaN(numArr[0]) && !isNaN(numArr[1])) {
        myBool = true
      }
    }
  }
  return myBool
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: numberValidator,
      message: props => `${props.value} is not a valid Phone number. Phone number is in form of XX-XX.... or XXX-XX... containing only numbers and at minimun 8 long`
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
