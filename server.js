import express from "express";
const app = express();
app.use(express.static("dist"));

app.get("/api/", (request, response) => {
  response.send("Hello Express");
});

const port = process.env["PORT"] || 3000;
console.log(`http://localhost:${port}/`)
app.listen(port);
