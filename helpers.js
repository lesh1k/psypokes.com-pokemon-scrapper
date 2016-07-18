/* eslint no-console: 0 */
'use strict';

const fs = require('fs');


function writeToFile(file, data) {
    let fd = fs.openSync(file, 'a+');
    fs.writeSync(fd, data);
    fs.closeSync(fd);
}

function cleanFile(file) {
    let fd = fs.openSync(file, 'w+');
    fs.writeSync(fd, '');
    fs.closeSync(fd);
}


module.exports = {
    writeToFile: writeToFile,
    cleanFile: cleanFile
};
