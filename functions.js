const { createHash, randomBytes } = require("crypto");

const hashed = (password) => {
    const hash = createHash('sha256').update(password).digest("hex");
    return hash;
}

const createNewHash = () => {
    const bytes = randomBytes(16);
    const hash = createHash('sha256').update(bytes).digest("hex");
    return hash;
}

module.exports = {
    hashed,
    createNewHash
}