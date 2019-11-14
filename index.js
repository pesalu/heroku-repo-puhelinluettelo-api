require('dotenv').config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

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
  Person.find({}).then(persons => {
    const nPersons = persons.length;
    res.send('<h1>Phone book</h1> <div>Phone book has info for ' + persons.length + ' persons</div>' +
           '<div>' + new Date() + '</div>' )
  });
})

app.get( baseUrl + '/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map( person => person.toJSON()));
  });
})

app.get( baseUrl + '/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person.toJSON());
    } else {
      next();
    }
  })
  .catch(error => next(error));
});

app.post( baseUrl + '/persons', (req, res, next) => {
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
  })
  .catch(error => next(error));

});

app.put( baseUrl + '/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete( baseUrl + '/persons/:id', (req, res) => {
  // const id = Number(req.params.id);
  const useFindAndModify = false; 
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(error => {
      next(error)
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

// Palvelimen virheenkäsittely
const errorHandler = (error, request, response, next) => {

  if (error.name === 'TypeError') {
    return response.status(500).send({ error: error.message })
  }

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError' ) {
    return response.status(400).send(error.message)
  }

  next(error)
}

app.use(errorHandler);

// const PORT = 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})