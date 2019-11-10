require('dotenv').config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors());
app.use(bodyParser.json());

morgan.token('showPayload', (req, res) => { if (!isEmpty(req.body)) {return JSON.stringify(req.body)} });
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.showPayload(req, res)
  ].join(' ');
}));

function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

const baseUrl = "/api";

app.get( baseUrl + '/info', (req, res) => {
  res.send('<h1>Phone book</h1> <div>Phone book has info for ' + persons.length + ' persons</div>' +
           '<div>' + new Date() + '</div>' )
})

app.get( baseUrl + '/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map( person => person.toJSON()));
  });
})

app.get( baseUrl + '/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person.toJSON());
    } else {
      console.log('0000')
      res.status(404).end();
    }
  })
  .catch(error => {
    console.log(error);
    res.status(400).send({error: 'Malformatted id'});
  });
});

app.post( baseUrl + '/persons', (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Content missing!'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON());
  });

});

app.delete( baseUrl + '/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!persons.find(person => person.id === id)) {
    res.status(404).end();
  } else {
    persons = persons.filter(person => person.id !== id);
    res.status(204).end();
  }
});

// const PORT = 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})