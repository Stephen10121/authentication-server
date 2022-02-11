const { createHash, randomBytes, createCipheriv } = require("crypto");
const request = require('request');

const encrypt = (iv2, key, data) => {
    const algorithm = 'aes-256-ctr';
    const secretKey = hashed(iv2+key).substring(0,32);
    const iv = randomBytes(16);

    const cipher = createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    return {iv: iv.toString('hex'), content: encrypted.toString('hex')};
};

const hashed = (password) => {
    const hash = createHash('sha256').update(password).digest("hex");
    return hash;
}

const createNewHash = () => {
    const bytes = randomBytes(16);
    const hash = createHash('sha256').update(bytes).digest("hex");
    return hash;
}

const sendRequest = async (website, key, cookie) => {
    var clientServerOptions = {
        uri: website,
        body: JSON.stringify({data: encrypt(website, key, cookie)}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, (error, response) => {
        if (error) {
            console.log(error);
        }
        return;
    });
}

module.exports = {
    hashed,
    sendRequest,
    createNewHash
}