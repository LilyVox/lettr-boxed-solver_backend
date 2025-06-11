import express from "express";
import { wordsFinder, wordStringer } from "./solver/index.js";
const app = express();
const PORT = 3000;
app.get("/", (req, res) => {
    res.send("Hello from Express!");
});
app.get("/solver/:p1/:p2/:p3/:p4", (req, res) => {
    let pockets = [req.params.p1, req.params.p2, req.params.p3, req.params.p4];
    res.send(wordStringer(pockets));
});
app.get("/words/:p1/:p2/:p3/:p4", (req, res) => {
    let pockets = [req.params.p1, req.params.p2, req.params.p3, req.params.p4];
    res.send(wordsFinder(pockets));
});
app.get("/solver", (req, res) => {
    let pockets = ["nks", "cut", "hbl", "aro"];
    res.send(wordStringer(pockets));
});
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}/`);
});
