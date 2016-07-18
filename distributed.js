'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const co = require('co');
const cluster = require('cluster');
const NUM_CPUs = require('os').cpus().length;
const NUMBER_OF_WORKERS = NUM_CPUs;

const ROOT_URL = 'http://www.psypokes.com/dex/';
const START_URL = 'http://www.psypokes.com/dex/sprites.php?view=regular&gen=1';
const worker = require('./worker');


if (cluster.isMaster) {
    co(scrape());
} else {
    worker.work();
}

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
    console.log('URL', url);
    const $ = cheerio.load(html);
    const $table = $('.psypoke');
    const $pokemons = $table.find('a');
    const count = $pokemons.length;

    let pokemons = $pokemons.toArray().map((pk, i) => {
        const img_url = ROOT_URL + $pokemons.eq(i).find('img').attr('src');
        const img_name = $pokemons.eq(i).text().replace('\n', ' ');
        return {
            name: img_name,
            url: img_url
        };
    });

    const per_worker = count / NUMBER_OF_WORKERS;

    let exitListener;
    let p = new Promise(resolve => {
        let workers_done = 0;
        exitListener = function() {
            workers_done++;
            if (workers_done === NUMBER_OF_WORKERS) {
                resolve(workers_done);
            }
        };
    });
    cluster.on('exit', exitListener);

    for (let i = 0; i < NUMBER_OF_WORKERS; i++) {
        let to_fetch = [];
        if (i + 1 < NUMBER_OF_WORKERS) {
            to_fetch = pokemons.slice(i * per_worker, (i + 1) * per_worker);
        } else {
            to_fetch = pokemons.slice(i * per_worker, count);
        }

        cluster.fork({
            pokemons: JSON.stringify(to_fetch)
        });
    }

    yield p;
    cluster.removeListener('exit', exitListener);
}
