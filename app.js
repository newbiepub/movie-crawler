import finalhandler from 'finalhandler';
import http from "http";
import app from "./router";

const server = http.createServer(
    (req, res) => app(
        req, res, finalhandler(req, res)
    )
);

export default server