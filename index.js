'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const co = require('co');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PATH = 'pokemons';
const IMG_EXTENSION = '.png';
const ROOT_URL = 'http://www.psypokes.com/dex/';
const START_URL = 'http://www.psypokes.com/dex/sprites.php?view=regular&gen=1';


co(scrape());

function* scrape() {
    let URLS = yield * getAllUrls(START_URL);
    URLS = URLS.slice(0, 6);
    for (let i = 0; i < URLS.length; i++) {
        yield * scrapePage(URLS[i]);
    }
}

function* getAllUrls(url) {
    const response = yield fetch(url);
    const html = yield response.text();
    const $ = cheerio.load(html);
    const $urls = $('.vertical_padded').first().find('a');
    return Array.prototype.slice.call($urls).map(url => {
        return ROOT_URL + $(url).attr('href');
    });
}

function* scrapePage(url) {
    const response = yield fetch(url);
    const html = yield response.text();
    console.log('HERE', url);
    const $ = cheerio.load(html);
    const $table = $('.psypoke');
    const $pokemons = $table.find('a');

    for (let i = 0; i < $pokemons.length; i++) {
        yield * fetchPokemon($pokemons.eq(i));
    }
}

function* fetchPokemon($pokemon) {
    const img_url = ROOT_URL + $pokemon.find('img').attr('src');
    const img_name = $pokemon.text().replace('\n', ' ');
    const filename = path.join(PATH, img_name + IMG_EXTENSION);
    console.log(img_name);

    const file = fs.createWriteStream(filename);
    const resp = yield new Promise(resolve => {
        http.get(img_url, function(response) {
            resolve(response);
        });
    });
    resp.pipe(file);
}
