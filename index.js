import express from "express";
import axios from "axios";

import pokemon from "pokemon";

const app = express();
const port = 3000;

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const pokemonNames = pokemon.all();

class Pokemon {
  constructor() {
    this.id;
    this.name;
    this.flavour_text;
    this.height;
    this.weight;
    this.habitat;
    this.category;
    this.abilities;
    this.egg_groups;
    this.types;
    this.cry;
    this.img;
    this.stats;
    this.moves;
    this.genus;
    this.movesData;
  }
}

app.use(express.static("public"));
app.get("/", async (req, res) => {
  res.render("index.ejs", { pokemonList: pokemonNames });
});
app.get("/pokemon", (req, res) => {
  const pokemon = req.query.pokemon.toLowerCase();

  var pokeAbilitysUrls = [];

  var poki = new Pokemon();
  axios
    .get(API_URL + pokemon)
    .then((response) => {
      poki.id = response.data.id;
      poki.name = response.data.name;
      poki.types = response.data.types;
      poki.height = response.data.height;
      poki.weight = response.data.weight;
      poki.img = response.data.sprites.other["official-artwork"].front_default;
      poki.abilities = response.data.abilities;
      poki.cry = response.data.cries.latest;
      poki.stats = response.data.stats;
      poki.moves = response.data.moves;

      response.data.moves.forEach((move) => {
        pokeAbilitysUrls.push(move.move.url);
      });
      axios
        .get(response.data.species.url)
        .then((response) => {
          poki.flavor_text = response.data.flavor_text_entries[3].flavor_text;
          poki.egg_groups = response.data.egg_groups;
          poki.habitat = response.data.habitat;
          poki.genus = response.data.genera[7].genus;
        })
        .then(() => {
          console.log(pokeAbilitysUrls);
          axios
            .all(pokeAbilitysUrls.map((endpoints) => axios.get(endpoints)))
            .then((data) => {
              poki.movesData = data;

              res.render("pokemon.ejs", {
                pokemon: poki,
              });
            })
            .catch((error) => {
              console.log("meh");
              var errorMessage =
                "Ups i thinks someone played with the connection! just retry or search for another pokemon ";
              res.render("pokemon.ejs", { errorMsg: errorMessage });
            });
        });
    })

    .catch((error) => {
      console.log(error.data);
    });
});
app.get("/random", (req, res) => {
  let randomPokemon =
    pokemonNames[Math.floor(Math.random() * pokemonNames.length)];
  console.log(randomPokemon);
  res.redirect("/pokemon?pokemon=" + randomPokemon);
});

app.listen(port, () => {
  console.log(`App is listening on Port ${port}`);
});
