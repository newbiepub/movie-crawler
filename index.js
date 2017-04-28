import server from "./app";

server.listen((process.env.PORT || 5000), () => {
   console.log("App is running on http://localhost:"+(process.env.PORT || 5000));
});