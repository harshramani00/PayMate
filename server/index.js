const express = require("express");

const { PORT } = require("./config.js")

const app = express()

app.get('', (request, response) =>{
    response.send("PayMate App Server");
    response.end();
});

app.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`);
});