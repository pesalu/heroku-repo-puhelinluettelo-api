require('dotenv').config();
const mongoose = require('mongoose');

const dbUrl = process.env.MONGODB_URI;

// URL to database
// const dbUrl = `mongodb+srv://mongoman:m0ng0m4n@cluster0-yjapj.mongodb.net/phonenumbers-app?retryWrites=true&w=majority`
mongoose.connect(dbUrl, { useNewUrlParser: true })
  .then(result => {
    console.log('Connected to mongoDb');
  })
  .catch((error) => {
    console.log('error connecting to mongoDb: ', error.message);
  })

// DB-Schema definitions
const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    console.log('DOCUMENT ', document)
    console.log('RETURNED OBJECT ', document)
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
});

// Model definition
const Person = mongoose.model('Person', personSchema);

module.exports = Person;