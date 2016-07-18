'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const co = require('co');

const PATH = 'pokemons_distributed';
const IMG_EXTENSION = '.png';

function work() {
    co(function* (){
        let pokemons = JSON.parse(process.env.pokemons);
        for (let i = 0; i < pokemons.length; i++) {
            yield * fetchPokemon(pokemons[i].url, pokemons[i].name);
        }

        process.exit();
    });
}

function* fetchPokemon(url, name) {
    const filename = path.join(PATH, name + IMG_EXTENSION);
    console.log(name);

    const file = fs.createWriteStream(filename);
    const resp = yield new Promise(resolve => {
        http.get(url, function(response) {
            resolve(response);
        });
    });
    resp.pipe(file);
}

module.exports = {
    work: work
};
