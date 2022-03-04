const Database = require('sqlite-async');
const fs = require("fs");
const { hashed, createNewHash } = require("./functions");
const res = require('express/lib/response');

async function createTable() {
    const db = await Database.open("./users.db");
    try {
        await db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            usersName varchar(200) NOT NULL,
            usersRName varchar(200) NOT NULL,
            usersEmail varchar(200) NOT NULL,
            usersPhone varchar(100) NOT NULL,
            usersPassword varchar(300) NOT NULL,
            users2FA varchar(10) NOT NULL,
            usersHash varchar(300) NOT NULL
        )`);
    } catch (error) {
        console.error(error.message);
    } finally {
        await db.close();
        createOtherTable();
        return 200;
    }
}

async function createOtherTable() {
    const db = await Database.open("./users.db");
    try {
        await db.run(`CREATE TABLE sites (
            id INTEGER PRIMARY KEY,
            sitesOwner varchar(200) NOT NULL,
            sitesWebsite varchar(200) NOT NULL,
            sitesHash varchar(300) NOT NULL
        )`);
    } catch (error) {
        console.error(error.message);
    } finally {
        await db.close();
        return 200;
    }
}

async function getUser(user) {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM USERS WHERE usersName=?";
    const result = await db.all(sql, [user]);
    await db.close();
    return result;
}

async function getUser2(user) {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM USERS WHERE usersHash=?";
    const result = await db.all(sql, [user]);
    await db.close();
    return result;
}

async function getSites(id, website) {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM sites WHERE sitesOwner=? AND sitesWebsite=?";
    const result = await db.all(sql, [id, website]);
    await db.close();
    return result;
}


async function getAllUsers() {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM USERS";
    const result = await db.all(sql, []);
    await db.close();
    return result;
}

async function getUserById(id) {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM USERS WHERE id=?";
    const result = await db.all(sql, [id]);
    await db.close();
    return result;
}

async function getHash(username) {
    const db = await Database.open("./users.db");
    let sql = "SELECT usersHash FROM USERS WHERE usersName=?";
    const result = await db.all(sql, [username]);
    await db.close();
    if (result.length > 0) {
        return result[0].usersHash;
    }
    return "error";
}

async function addUser(name, rName, email, password, twoFA, phone) {
    const db = await Database.open("./users.db");
    const insertStatement = "INSERT INTO users (usersName, usersRName, usersEmail, usersPassword, users2FA, usersPhone, usersHash) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    try {
        const result = db.run(insertStatement, [name, rName, email, password, twoFA, phone, createNewHash()]);
        await db.close();
        return result;
    } catch (err) {
        console.error(err);
        return 'error';
    }
}

async function addSite(owner, website) {
    const db = await Database.open("./users.db");
    const insertStatement = "INSERT INTO sites (sitesOwner, sitesWebsite, sitesHash) VALUES (?, ?, ?)";
    
    try {
        const result = db.run(insertStatement, [owner, website, hashed(hashed(owner.toString())+hashed(website))]);
        await db.close();
        return result;
    } catch (err) {
        console.error(err);
        return 'error';
    }
}

async function editUser(id, name, rName, email, password, twoFA, phone) {
    const db = await Database.open("./users.db");
    const updateStatement = "UPDATE users SET usersName=?, usersRName=?, usersEmail=?, usersPassword=?, users2FA=?, usersPhone=? WHERE id=?";
    try {
        const result = await db.run(updateStatement, [name, rName, email, password, twoFA, phone, id]);
        await db.close();
        return result;
    } catch (err) {
        console.error(err);
        return 'error';
    }
}

async function signup(username, userPassword, userEmail, name, phone, twofa) {
    const users = await getUser(username);
    if (users.length !== 0) {
        return({error: 1005, errorMessage: "Username Taken"});
    }
    const result = await addUser(username, name, userEmail, hashed(userPassword), twofa? "true" : "false", phone);
    
    if (result === "error") {
        return({error: 1006, errorMessage: "Error Saving Data 1006"});
    }
    return({error: 200, key: await getHash(username)});
}

async function userLogin(username, password) {
    const users = await getUser(username);
    if (users.length === 0) {
        return({errorMessage: "Invalid Username", error: 1000});
    }

    if (users[0].usersPassword !== hashed(password)) {
        return({error: 1001, errorMessage: "Invalid Password"});
    }
    return({error: 200, data: hashed(hashed(password)), hash: await getHash(username)});
}

async function getUserData(user) {
    const users = await getUser(user);
    return users[0];
}

async function getOtherWebsiteKey(website, cookie) {
    const gotUserData = await getUser(cookie);
    if (gotUserData.length < 1) {
        return "User doesnt exist";
    }
    let userSites = await getSites(gotUserData[0].id, website);
    if (userSites.length === 0) {
        await addSite(gotUserData[0].id, website);
        userSites = await getSites(gotUserData[0].id, website);
    }
    return userSites[0].sitesHash;
}

//createTable().then(data=>console.log(data));


module.exports = {
    signup,
    userLogin,
    getUserData,
    getUser,
    getOtherWebsiteKey
}
