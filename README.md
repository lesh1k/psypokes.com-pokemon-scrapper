## psypoke.com scrapper  

NodeJS script to download all pokemon images and renames them accordingly (e.g. instead of 001.png, it will be #001Bulbasaur.png)  

There are two versions of the script:  
- Single process ([index.js](index.js)) [Run time 500s-700s]  
- Multi-process, spawning one worker per each CPU core ([distributed.js](distributed.js)) [Run time ~80s]  

Both versions are intended to give the same output.  
The distributed version runs on average 80 seconds, while the single-process runs in-between 500 and 700 seconds.  

NOTE: To run locally, in the root directory of the project, create two folders `pokemons` and `pokemons_distributed`, these are the directories where [index.js](index.js) and [distributed.js](distributed.js), respectively, save downloaded images.  
NOTE #2: To be sure that you have all required NPM packages either check [package.json](package.json) OR run `npm install` from root directory of the project.
