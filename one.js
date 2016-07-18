'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const co = require('co');
const http = require('http');
const fs = require('fs');

const helpers = require('./helpers');
const ROOT_URL = 'http://www.psypokes.com/dex/';
const START_URL = 'http://www.psypokes.com/dex/sprites.php?view=regular&gen=1';
const IMG_EXTENSION = '.png';


co(scrapePage(START_URL));

function* scrapePage(url) {
    const response = yield fetch(url);
    const html = yield response.text();
    const $ = cheerio.load(html);
    const $table = $('.psypoke');
    const $pokemon = $table.find('a').first();
    const img_url = ROOT_URL + $pokemon.find('img').attr('src');
    const img_name = $pokemon.text().replace('\n', ' ');
    const filename = img_name + IMG_EXTENSION;
    console.log(filename);
    const img_page = yield fetch(img_url);
    const img_data = yield img_page.text();



    const file = fs.createWriteStream(filename);
    const resp = yield new Promise(resolve => {
        http.get(img_url, function(response) {
            resolve(response);
        });
    });
    resp.pipe(file);
}
