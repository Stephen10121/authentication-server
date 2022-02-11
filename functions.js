const { createHash, randomBytes } = require("crypto");
const request = require('request');

const hashed = (password) => {
    const hash = createHash('sha256').update(password).digest("hex");
    return hash;
}

const createNewHash = () => {
    const bytes = randomBytes(16);
    const hash = createHash('sha256').update(bytes).digest("hex");
    return hash;
}

const sendRequest = async (website, data) => {
    var clientServerOptions = {
        uri: website,
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, (error, response) => {
        console.log(error);
        return;
    });
}

module.exports = {
    hashed,
    sendRequest,
    createNewHash
}