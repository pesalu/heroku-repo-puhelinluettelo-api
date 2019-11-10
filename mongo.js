const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://mongoman:${password}@cluster0-yjapj.mongodb.net/phonenumbers-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const noteSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Note = mongoose.model('Person', noteSchema)

if (name && number) {
  const note = new Note({
    name: name,
    number: number,
  })
  note.save().then(response => {
    console.log('added ' + name + ' number ' + number);
    mongoose.connection.close();
  });
} else {
  Note.find({}).then(result => {
    console.log('Phonebook:');
    result.forEach(person => {
      console.log(person.name + ' ' + person.number);
    })
    mongoose.connection.close()
  })
}




