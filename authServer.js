require('dotenv').config();
const http = require("http");
const express = require('express');
const { signup, userLogin, getUserData, getUser, getOtherWebsiteKey } = require("./database");
const { sendRequest } = require("./functions");
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const PORT = 5400;
const app = express();
const jwt = require('jsonwebtoken');
const {sendMail} = require("./mail.js");

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.set('view engine', 'ejs');
app.use(limiter, cookieParser(), express.json(), express.static('public'), express.urlencoded({ extended: true }));

const server = http.createServer(app);

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    console.log(`[server] ${ip} requested home page.`);
    res.render('index');
});
app.get("/signup", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    console.log(`[server] ${ip} requested signup page.`);
    res.render('signup');
});

app.get("/auth", async (req, res) => {
    if (req.cookies["G_VAR"]) {
        console.log(`[server] Verifying ${req.cookies.G_VAR}`);
        jwt.verify(req.cookies["G_VAR"], process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) {
                return res.clearCookie("G_VAR").render("auth");
            }
            const userif = await getUser(user);
            if (userif.length == 0) {
                return res.clearCookie("key").render("auth");
            }
            const user2 = await getUserData(user);
            return res.render('auth', {userName:user2.usersRName});
        });
        return;
    }
    res.render("auth");
});

app.post("/auth", async (req, res) => {
    if (!req.body.userData) {return res.json({error: true, errorMessage: "Missing parameters"});}
    if (!req.body.userData["website"] || !req.body.userData["key"] || !req.body.userData["cookie"]) {
        return res.json({error: true, errorMessage: "Missing parameters."});
    }
    jwt.verify(req.body.userData.cookie, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.json({error: true, errorMessage: "Invalid token."});
        }
        const userif = await getUser(user);

        if (userif.length == 0) {
            return res.json({error: true, errorMessage: "Invalid token."});
        }

        if (await sendRequest(req.body.userData.website, req.body.userData.key, user, getOtherWebsiteKey, userif[0].usersRName, userif[0].usersEmail, userif[0].usersName)==="error") {
            return res.json({error: true, errorMessage: "Invalid URL."});
        } else {
            res.json({msg: 'good'});
        }
    });
});

app.post("/login", async (req, res) => {
    if (!req.body["userData"]) {
        return res.json({error: true, errorMessage: "An error occured. Please refresh"});
    }
    const data = req.body.userData;
    if (!data["username"] || !data["password"]) {
        return res.json({error: true, errorMessage: "Missing fields"});
    }
    const result = await userLogin(data.username, data.password);
    if (result.error != 200) {
        return res.json({error: true, errorMessage: result.errorMessage});
    }
    const accessToken = jwt.sign(data.username, process.env.ACCESS_TOKEN_SECRET);
    return res.cookie("G_VAR", accessToken, { maxAge: 990000000}).json({error: false});
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
    const accessToken = jwt.sign(data.username, process.env.ACCESS_TOKEN_SECRET);
    return res.cookie("G_VAR", accessToken, { maxAge: 990000000}).json({error: false});
});

app.post("/contact", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    console.log(`[server] ${req.body.email}@${ip} sent contact form.`);
    sendMail(req.body.email, req.body.what);
    res.json({msg: "Message Recieved!"});
});

server.listen(PORT, () => console.log(`[server] Running on port ${PORT}.`));
