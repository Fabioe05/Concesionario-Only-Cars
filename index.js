const app = require("./app");
const http = require("http");

const server = http.createServer(app);

server.listen(3000, () => {
  console.log("El servidor esta corriendo en el puerto 3000");
});
