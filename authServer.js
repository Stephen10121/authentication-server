const http = require("http");
const express = require('express');
const { signup, userLogin, getUserData } = require("./database");
const { sendRequest } = require("./functions");
const cookieParser = require('cookie-parser');
const PORT = 5400;
const app = express();
const url = require("url");

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "http://127.0.0.1:5400/");
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.set('view engine', 'ejs');
app.use(cookieParser(), express.json(), express.static('public'), express.urlencoded({ extended: true }));

const server = http.createServer(app);

app.get('/', (req, res) => res.render('index'));
app.get("/auth", async (req, res) => {
    if (req.cookies["G_VAR"]) {
        const user = await getUserData(req.cookies["G_VAR"]);
        return res.render('auth', {userName:user.usersRName});
    }
    res.render("auth");
});

app.post("/auth", async (req, res) => {
    console.log(req.body);
    // const queryObject = url.parse(req.url, true).query;
    // if (!queryObject.website || !queryObject.key) {
    //     return res.json({error: true, errorMessage: "Missing parameters."});
    // }
    // sendRequest(queryObject.website, {key: queryObject.key});
    res.json({msg: 'good'});
});

app.get("/signup", (req, res) => res.render('signup'));

app.post("/login", async (req, res) => {
    if (!req.body.userData) {
        return res.json({error: true, errorMessage: "An error occured. Please refresh"});
    }
    const data = req.body.userData;
    if (!data.username || !data.password) {
        return res.json({error: true, errorMessage: "Missing fields"});
    }
    const result = await userLogin(data.username, data.password);
    if (result.error != 200) {
        return res.json({error: true, errorMessage: result.errorMessage});
    }
    return res.cookie("G_VAR", result.hash, { maxAge: 990000000}).json({error: false});
});

app.post("/signup", async (req, res) => {
    if (!req.body.userData) {
        return res.json({error: true, errorMessage: "An error occured. Please refresh"});
    }
    const data = req.body.userData;
    data["phone"] = "false";
    if (!data.rname || !data.email || !data.username || !data.phone || !data.password || !data.rpassword) {
        return res.json({error: true, errorMessage: "Missing fields"});
    }
    if (data.password !== data.rpassword) {
        return res.json({error: true, errorMessage: "Passwords don't match!"})
    }
    const result = await signup(data.username,  data.password, data.email, data.rname, data.phone, data.twofa);
    if (result.error !== 200) {
        return res.json({error: true, errorMessage: result.errorMessage});
    }
    return res.cookie("G_VAR", result.key, { maxAge: 990000000}).json({error: false});
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}.`));