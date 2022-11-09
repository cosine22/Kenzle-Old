const results = document.querySelector("#results");
const userIn = document.querySelector("#q");
const res = document.getElementById("result");
let endTitle;
const correctSongName = document.getElementById("mystery-song-title");
const playAgainSpace = document.querySelector("playAgain");
let endScreen;
let startScreen = document.getElementById("intro-card-inner");
const correctSongCover = document.getElementById("endImg");
let cardBtn;
let introBtn = document.getElementById("start-button");
const suggs = res.children;
const page = document.querySelector("body");
const lifeDisplay = document.querySelector("lives");
const game = document.getElementById("main-container");

let toGuess;
let lives = 7;
let guesses = [];

page.onload = async function () {
  toGuess = await getRandomSong();
  console.log(toGuess);
};

introBtn.addEventListener("click", function (e) {
  e.preventDefault;
  startScreen.remove();
  game.style.opacity = 1;
});

class guessedTrack {
  constructor(name, album, trackNumber) {
    this.name = name;
    this.album = album;
    this.trackNumber = trackNumber;
  }
}

let albums = [];
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "bc5fd184abmsh4432e6534b0ed10p16daf9jsn607184d20cb2",
    "X-RapidAPI-Host": "theaudiodb.p.rapidapi.com",
  },
};

//Returns albums given artist name
const getAlbumData = async function () {
  let artist;
  const res = await fetch(
    "https://theaudiodb.p.rapidapi.com/searchalbum.php?s=Kendrick%20Lamar",
    options
  );

  artist = await res.json();
  return artist;
};

const soloAlbumIndexes = [0, 3, 4, 6, 7, 11];

//Returns album_ids of solo Albums in discography db
async function setAlbumData() {
  let als = await getAlbumData();
  albums = Object.values(als);
  albums = albums[0];
  let c = 0;
  albums.forEach((albm, i) => {
    if (soloAlbumIndexes.includes(i)) {
      soloAlbumIndexes[c] = Number(albm.idAlbum);
      c++;
    }
  });

  soloAlbumIndexes.sort(function (a, b) {
    return a - b;
  });

  let temp = [];
  temp = soloAlbumIndexes[1];
  soloAlbumIndexes[1] = soloAlbumIndexes[0];
  soloAlbumIndexes[0] = temp;
  return soloAlbumIndexes;
}

//Used to get songs
const options2 = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "bc5fd184abmsh4432e6534b0ed10p16daf9jsn607184d20cb2",
    "X-RapidAPI-Host": "theaudiodb.p.rapidapi.com",
  },
};

//Returns string array of every tracklist (songs in order/ albums not)
//Clunky asf
const printTracks = async function () {
  let albms = [];

  await setAlbumData().then((ids) => {
    ids.forEach((id) => {
      //For every id
      let album = getTracks(id).then((res) => {
        let tracklist = [];
        // get tracks of id
        res.forEach((track) => {
          tracklist.push(track.strTrack);
        });
        return tracklist;
      });
      albms.push(album);
    });
  });

  return Array.of(albms)[0];
};

//Returns object of all tracks given album id
const getTracks = async function (id) {
  let tracks;
  const res = await fetch(
    `https://theaudiodb.p.rapidapi.com/track.php?m=${id}`,
    options2
  );

  tracks = await res.json();
  tracks = Object.values(tracks)[0];
  return tracks;
};

//returns tracklist of strings
const getTracklist = async function () {
  let tracklist = [];
  let albms = await printTracks();

  Promise.all(albms).then((a) => {
    tracklist.push(a.flat());
  });

  return tracklist;
};

//gets the song you must guess
const getRandomSong = async function () {
  tracklist = [];
  let albms = await printTracks();

  Promise.all(albms).then((a) => {
    tracklist.push(a);
  });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      tracklist = tracklist[0];
      let record = tracklist[Math.floor(Math.random() * tracklist.length)];
      let indexOfAlbum = tracklist.indexOf(record);
      let track = record[Math.floor(Math.random() * record.length)];
      let indexOfTrack = record.indexOf(track);
      console.log(track);

      resolve({ indexOfAlbum, indexOfTrack });
    }, 1500);
  });
};

//get user Guess
async function userGuess() {
  let r = toGuess;
  if (!toGuess) r = await getRandomSong();
  let guess = "";
  let guessedTrack = {};
  guess = userIn.value;
  let a = tracklist.find((el) => el.includes(guess));
  let albumNumber = tracklist.indexOf(a);
  let trackNumber = a.indexOf(guess);
  guessedTrack = { albumNumber, trackNumber, r };
  return guessedTrack;
}

//Compare song locations between guess and ans
function hiLo(guess, ans) {
  if (guess > ans) {
    return `↓`;
  } else if (guess < ans) {
    return `↑`;
  } else return "";
}

//display user Guess
async function displayGuess() {
  let guess = await userGuess();
  let r = guess.r;

  let albumDist = Math.abs(guess.albumNumber - r.indexOfAlbum);
  let trackDist = Math.abs(guess.trackNumber - r.indexOfTrack);

  let name = tracklist[guess.albumNumber][guess.trackNumber];
  let guess1 = new guessedTrack(name, guess.albumNumber, guess.trackNumber);
  guesses.push(guess1.name);
  let tLoc = hiLo(guess1.trackNumber, r.indexOfTrack);
  let aLoc = hiLo(guess1.album, r.indexOfAlbum);
  let html = `<tr id="result-rows">
  <td id="table-text" class="guessImg"><img src="albumCovers/cover${
    guess1.album
  }.png" alt="" class="album-cvr" />${aLoc}</td>
  <td id="table-text" class="guessName">${guess1.name}</td>
  <td id="table-text" class="track-number">${
    guess1.trackNumber + 1
  } ${tLoc}</td>
</tr>
<tr>
  <td class="song-cell grey">
    <p class="song-title"></p>
  </td>
  <td class="album-cell grey up">
    <td class="album-cell-inner">
    </td>
  </td>
  <td class="track-cell grey up">
  </td>
</tr>`;
  results.insertAdjacentHTML("afterend", html);

  let trackNum = document.getElementsByClassName("track-number")[0];
  if (trackDist <= 2 && trackDist != 0) {
    trackNum.style.backgroundColor = "yellow";
  } else if (trackDist == 0) {
    trackNum.style.backgroundColor = "green";
  }

  let guessImg = document.getElementsByClassName("guessImg")[0];
  if (albumDist === 1) {
    guessImg.style.backgroundColor = "yellow";
  } else if (albumDist === 0) {
    guessImg.style.backgroundColor = "green";
  }

  lives -= 1;
  let lifeText = lifeDisplay.querySelector("h3");
  lifeText.innerText = `Lives: ${lives}`;

  if (lives <= 0) {
    fillEndCard(
      tracklist[r.indexOfAlbum][r.indexOfTrack],
      r.indexOfAlbum,
      lives
    );
  }
  if (trackDist + albumDist == 0) {
    console.log("CORRECT");
    fillEndCard(
      tracklist[r.indexOfAlbum][r.indexOfTrack],
      r.indexOfAlbum,
      lives
    );

    //WIN THE GAME
  }
}

//Checks if guess is a valid track
async function validTrack(track) {
  let tracklist = await search_terms;

  let isIn = tracklist[0].includes(track);
  return isIn;
}

//Another version of tracks
var search_terms = Promise.resolve(getTracklist());

//Autocomplete function
async function autocompleteMatch(input) {
  input = input.toLowerCase();
  let terms = (await search_terms)[0];
  if (input == "") {
    return [];
  }
  var reg = new RegExp(input);

  return terms.filter(function (term) {
    term = term.toLowerCase();
    if (term.match(reg)) {
      return term;
    }
  });
}

//Display autocorrect suggestions
async function showResults(val) {
  res.innerHTML = "";
  let list = "";
  let terms = await autocompleteMatch(val);
  for (i = 0; i < 4; i++) {
    if (!guesses.includes(terms[i]) && terms[i]) {
      list += "<li>" + terms[i] + "</li>";
    }
  }
  res.innerHTML = "<ul>" + list + "</ul>";
}

//Click on suggestion
res.addEventListener("mouseover", function () {
  if (lives >= 1) {
    let choices = suggs[0];
    let temp;
    if (choices) {
      choices = choices.childNodes;
      choices.forEach((c) => {
        c.onclick = function (e) {
          e.preventDefault();
          userIn.value = c.innerText;
          temp = c.innerText;
          displayGuess();
          userIn.value = "";
          res.innerHTML = "";
        };
      });
    }
  }
});

//Shows end card!!
function fillEndCard(title, album, lives) {
  let html = `<div id="card-background">
  <div id="end-card">
    <button id="close-end-button">X</button>
    <div id="end-card-inner">
      <div id="end-card-inner-title-container">
        <h1 id="end-card-title"></h1>
      </div>
      <div id="endImg">
      <img src="albumCovers/cover${album}.png"{" alt id="mystery-song-img">
      </div>
      <p id="mystery-song-title">${title}</p>
    </div> 
  </div>
</div>`;
  page.insertAdjacentHTML("afterend", html);

  endTitle = document.getElementById("end-card-title");

  endTitle.textContent = lives > 0 ? "You win!" : "You lose!";

  endScreen = document.getElementById("card-background");
  cardBtn = document.getElementById("close-end-button");

  cardBtn.addEventListener("click", function (e) {
    endScreen.remove();
    spawnPlayAgainBtn();
  });
}

//Add play again button
function spawnPlayAgainBtn() {
  let html = `<button id="play-again-button">Play Again!</button>`;
  playAgainSpace.insertAdjacentHTML("beforeend", html);
  const playAgainBtn = document.getElementById("play-again-button");
  playAgainBtn.addEventListener("click", function (e) {
    e.preventDefault();
    location.reload();
  });
}
