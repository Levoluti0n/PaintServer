import wssServer from "express-ws";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
// import functions from "firebase-functions";

const PORT = process.env.PORT || 8080;
const app = express();
const expressWs = wssServer(app);
const aWss = expressWs.getWss();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    msg = JSON.parse(msg);
    switch (msg.method) {
      case "connection":
        connectionHandler(ws, msg);
        break;
      case "draw":
        broadcastConnection(ws, msg);
        break;

      default:
        break;
    }
  });
});

app.post("/image", (req, res) => {
  try {
    const data = req.body.img.replace("data:image/png;base64,", "");
    fs.writeFileSync(
      path.resolve("data", `${req.query.id}.jpg`),
      data,
      "base64"
    );
    return res.status(200).json({ message: "Loaded" });
  } catch (error) {
    return res.status(500).json({ message: "error" });
  }
});
app.get("/image", (req, res) => {
  console.log('s');
  try {
    const file = fs.readFileSync(path.resolve("data", `${req.query.id}.jpg`))
    const data = "data:image/png;base64," + file.toString('base64');
    res.json({data})
  } catch (error) {
    return res.status(500).json({ message: "error" });
  }
});

app.get('/test', (req, res) => {
  res.json({message: 'Success'})
})

app.listen(PORT, () => console.log(`Server is started in the port ${PORT}`));

function connectionHandler(ws, msg) {
  ws.id = msg.id;
  broadcastConnection(ws, msg);
}
function broadcastConnection(ws, msg) {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg));
    }
  });
}

// exports.api = functions.https.onRequest(app)