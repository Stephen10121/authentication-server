const { createHash, randomBytes, createCipheriv } = require("crypto");
const { use } = require("express/lib/application");
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

const sendRequest = async (website, key, cookie, getOtherWebsiteKey, name, email, username) => {
    const userData = await getOtherWebsiteKey(website, cookie);
    console.log({userData, website, key, cookie});
    var clientServerOptions = {
        uri: website,
        body: JSON.stringify({data: userData, key, name, email, username}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, (error, response) => {
        if (error) {
            return "error";
        }
        return;
    });
}

const getKey = async (website, cookie, getOtherWebsiteKey) => {
    const userData = await getOtherWebsiteKey(website, cookie);
    if (userData === "User doesnt exist") {
        return 404;
    } else {
        return userData;
    }
}

module.exports = {
    hashed,
    sendRequest,
    createNewHash,
    getKey
}
