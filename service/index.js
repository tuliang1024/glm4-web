const express = require("express");
const axios = require("axios");
const { jwtSign, contentConfig, handleStreamChunkFetch } = require("./chat");
require("dotenv").config();
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// 允许跨域
app.all("*", (_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "authorization, Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  next();
});

// 设置session中间件
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// 使用 body-parser 中间件来解析请求体
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/fetchZhiPuAPI", async (req, res) => {
  res.setHeader("Content-type", "application/octet-stream");

  // 设置session，后续可以使用用户登录进行判断
  if (!req.session.username) {
    req.session.username = "Mozi";
    req.session.messages = [];
    req.session.messages.push({
      role: "system",
      content: contentConfig.systemContent,
    });
    req.session.messages.push({
      role: "assistant",
      content: contentConfig.assistantContent,
    });
  }

  req.session.messages.push({
    role: "user",
    content: req.body.message,
  });

  // 调用jwtSign方法，获取jwt签名
  let [id, secret] = process.env.API_KEY.split(".");
  let st = new Date().valueOf();

  let res_auth_token = await jwtSign(secret, {
    api_key: id,
    timestamp: st,
    exp: new Date(st + 1000 * 60 * 60).valueOf(),
  });
  let my_headers = {
    Authorization: res_auth_token,
    "content-type": "application/json",
  };

  let response = await axios({
    method: "post",
    url: process.env.API_URL,
    headers: my_headers,
    data: {
      model: process.env.MODEL,
      messages: req.session.messages,
      stream: true,
    },
    responseType: "stream",
  });

  // 缓存整个数据
  response.data.pipe(res);
  let answer = "";
  response.data.on("data", (chunk) => {
    answer += handleStreamChunkFetch(chunk);
  });
  response.data.on("end", () => {
    req.session.messages.push({
      role: "assistant",
      content: answer,
    });
  });
});

app.post("/session", (req, res) => {
  console.log("session", req.body);
  res.send("Welcome");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
