//Sample for Assignment 3
const express = require("express");

//Import a body parser module to be able to access the request body as json
const bodyParser = require("body-parser");

//Use cors to avoid issues with testing on localhost
const cors = require("cors");

const app = express();

const port = 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

//Set Cors-related headers to prevent blocking of local requests
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//The following is an example of an array of two tunes.The content has been shortened to make it readable
const tunes = [
  {
    id: "0",
    name: "Für Elise",
    genreId: "1",
    content: [
      { note: "E5", duration: "8n", timing: 0 },
      { note: "D#5", duration: "8n", timing: 0.25 },
      { note: "E5", duration: "8n", timing: 0.5 },
      { note: "D#5", duration: "8n", timing: 0.75 },
      { note: "E5", duration: "8n", timing: 1 },
      { note: "B4", duration: "8n", timing: 1.25 },
      { note: "D5", duration: "8n", timing: 1.5 },
      { note: "C5", duration: "8n", timing: 1.75 },
      { note: "A4", duration: "4n", timing: 2 },
    ],
  },
  {
    id: "1",
    name: "Seven Nation Army",
    genreId: "0",
    content: [
      { note: "E5", duration: "4n", timing: 0 },
      { note: "E5", duration: "8n", timing: 0.5 },
      { note: "G5", duration: "4n", timing: 0.75 },
      { note: "E5", duration: "8n", timing: 1.25 },
      { note: "E5", duration: "8n", timing: 1.75 },
      { note: "G5", duration: "4n", timing: 1.75 },
      { note: "F#5", duration: "4n", timing: 2.25 },
    ],
  },
];

const genres = [
  { id: "0", genreName: "Rock" },
  { id: "1", genreName: "Classic" },
];

//Your endpoints go here
const apiPath = "/api/v1/"


// GET REQUESTS ========

app.get(apiPath + "tunes/:filter?",(req,res) => {
  let responseArr = [];
  let filterId = req.params.filter

  tunes.forEach(({id,name,genreId}) => {
    if (genreId == filterId || filterId == undefined) {
    responseArr.push({
      id,
      name,
      genreId
    })
  }
  });

  res.status(201).json(responseArr);
});


app.get(apiPath + "genres",(req,res) => {
  res.status(201).json(genres);
})


app.get(apiPath + "genres/:genreId/tunes/:tuneId",(req,res) => {
  const tuneId = req.params.tuneId;
  const genreId = req.params.genreId;

  const reqTune = tunes.find(tune => tune.id == tuneId && tune.genreId == genreId);

  res.status(201).json(reqTune);


})

// POST REQUESTS =======
app.post(apiPath + "genres/:genreId/tunes",(req,res) => {
  const genreId = req.params.genreId;
  // Verifies that the genre exists
  if (!genres.some(genre => genre.id == genreId )) return res.status(400).json({message: "Specified genre does not exist"})
  else if (
    !req.body ||
    !req.body.name ||
    !req.body.content
  ) return res.status(400).json({ message: "Tune needs a name and content",});
  else { 
    // TODO 
  }
});





// Default path for unsupported actions
app.get("*", (req, res) => {
    res.status(405).send("Operation not supported");
});

//Start the server
app.listen(port, () => {
  console.log("Tune app listening on port: " + port);
});
