require("dotenv").config();
var express = require("express");
var cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const simpleGit = require("simple-git");
const path = require("path");
var bodyParser = require("body-parser");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

var app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint to exchange code for access token
app.get("/getAccessToken", async function (req, res) {
  console.log(req.query.code);

  const params =
    "?client_id=" +
    CLIENT_ID +
    "&client_secret=" +
    CLIENT_SECRET +
    "&code=" +
    req.query.code;

  await fetch("https://github.com/login/oauth/access_token" + params, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      res.json(data);
    });
});

// getUserData
// Access token is going to passed in as an Authorization header

app.get('/getUserData', async function (req,res){
    req.get("Authorization"); // Bearer AccessToken
    await fetch("https://api.github.com/user",{
        method: "GET",
        headers: {
            "Authorization": req.get("Authorization") // Bearer AccessToken
        }
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data);
        res.json(data);
    })
})

// Endpoint to fetch user repositories
app.get("/getUserRepos", async function (req, res) {
  const authorization = req.get("Authorization"); // Bearer AccessToken
  if (!authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      method: "GET",
      headers: {
        Authorization: authorization,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching repositories" });
  }
});

// Endpoint to clone the repository
app.post("/cloneRepo", async (req, res) => {
  const { repoUrl, repoName } = req.body;
  const targetPath = path.join(__dirname, repoName);

  try {
    await simpleGit().clone(repoUrl, targetPath);
    res.status(200).json({ message: `${repoName} cloned successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to clone repository." });
  }
});

app.listen(4000, function () {
  console.log("CORS Server running on port 4000");
});
