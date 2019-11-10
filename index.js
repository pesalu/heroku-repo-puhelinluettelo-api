const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

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

let persons =  [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    },
    {
      "name": "test3",
      "number": "324234",
      "id": 9   
    },
    {
      "name": "test",
      "number": "123211211",
      "id": 11
    },
    {
      "name": "test22",
      "number": "1111",
      "id": 12
    }
  ];

const baseUrl = "/api";

app.get( baseUrl + '/info', (req, res) => {
  res.send('<h1>Phone book</h1> <div>Phone book has info for ' + persons.length + ' persons</div>' +
           '<div>' + new Date() + '</div>' )
})

app.get( baseUrl + '/persons', (req, res) => {
  res.json(persons)
})

app.get( baseUrl + '/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  let person = persons.find(person => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.post( baseUrl + '/persons', (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Content missing!'
    });
  } else if (persons.find(person => person.name === body.name)) {
    return res.status(400).json({
      error: 'Person with name ' + body.name + ' already exist!'
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat( person );
  res.json(person);
});

const generateId = () => {
  return Math.floor( Math.random() * Math.floor(1000000) );
}

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