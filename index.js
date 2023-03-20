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

let nextTuneId = 2;
let nextGenreId = 2;

//Your endpoints go here
const apiPath = "/api/v1/"


// GET REQUESTS ========

app.get(apiPath + "tunes/",(req,res) => {
  let responseArr = [];
  let filteredGenre = req.query.filter ? genres.find(genre => genre.genreName.toLowerCase() == req.query.filter.toLowerCase()) : undefined

  tunes.forEach(({id,name,genreId}) => {
    if (filteredGenre == undefined  || genreId == filteredGenre.id) {
    responseArr.push({
      id,
      name,
      genreId
    })
  }
  });

  res.status(200).json(responseArr);
});


app.get(apiPath + "genres",(req,res) => {
  res.status(200).json(genres);
})


app.get(apiPath + "genres/:genreId/tunes/:tuneId",(req,res) => {
  const tuneId = req.params.tuneId;
  const genreId = req.params.genreId;

  const reqTune = tunes.find(tune => tune.id == tuneId && tune.genreId == genreId);
  if (!reqTune) return res.status(404).json({message: "Tune not found"});
  res.status(200).json(reqTune);
})

// POST REQUESTS =======

// New Tune
app.post(apiPath + "genres/:genreId/tunes",(req,res) => {
  const genId = req.params.genreId;
  // Verifies that the genre exists
  if (!genres.some(genre => genre.id == genId )) return res.status(400).json({message: "Specified genre does not exist"})
  else if (
    !req.body ||
    !req.body.name ||
    !req.body.content 
  ) return res.status(400).json({ message: "Tune needs a name and content",});
  else if (!req.body.content.every(({note,duration,timing}) => {
    return note && duration && timing && typeof(duration) == "string"
  })) res.status(400).json({message: "Content needs to be a non empty array of objects with note, duration and timing properties"})
  else { 
    const newTune = {
      id: nextTuneId.toString(),
      name: req.body.name.toString(),
      genreId: genId.toString(),
      content: req.body.content
      };

    tunes.push(newTune);
    nextTuneId++;
    res.status(201).json(newTune);
  }
});

// New Genre
app.post(apiPath + "genres",(req,res) => {
  if (!req.body || !req.body.genreName) return res.status(400).json({message: "Genre needs a name"});
  else if (genres.some(genre => genre.genreName == req.body.genreName)) return res.status(400).json({message: "Genre already exists"});
  else {
    const newGenre = {
      id: nextGenreId.toString(),
      genreName: req.body.genreName.toString()
    };

    genres.push(newGenre);
    nextGenreId++;
    res.status(201).json(newGenre);
  }
})



// PATCH REQUESTS ========
app.patch(apiPath + "genres/:genreId/tunes/:tuneId",(req,res) => {
  const selectedIndex = tunes.findIndex(t => t.genreId == req.params.genreId && t.id == req.params.tuneId );
  const selectedTune = tunes[selectedIndex];
  
  if (selectedTune == undefined) res.status(400).json({"message":"No tune found with specified id and genreId"});
  else if (!genres.some(genre => genre.id == req.body.genreId)) res.status(400).json({"message":"Updated genre does not exist"});
  else {
    if (req.body.name) selectedTune.name = req.body.name.toString();
    if (req.body.genreId) selectedTune.genreId = req.body.genreId.toString();
    if (req.body.content) selectedTune.content = req.body.content;
  }

  res.status(200).json(selectedTune);
})


// DELETE REQUESTS ========
app.delete(apiPath + "genres/:genreId",(req,res) => {
  const genreId = req.params.genreId;
  const genreIndex = genres.findIndex(genre => genre.id == genreId);
  if (genreIndex === -1) return res.status(400).json({message: "Specified genre does not exist"});
  else if (tunes.some(tune => tune.genreId == genreId)) return res.status(400).json({message: "Cannot delete non-empty genre"});
  else {
    const genreIndex = genres.findIndex(genre => genre.id == genreId);
     const genre = genres.splice(genreIndex,1);
    res.status(200).json(genre);
  }
})

// Default path for unsupported actions
app.use("*", (req, res) => {
    res.status(405).json({ message: "Operation not supported" });
});



//Start the server
app.listen(port, () => {
  console.log("Tune app listening on port: " + port);
});
