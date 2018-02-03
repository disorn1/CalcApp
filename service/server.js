

const app = require("./app");

app.initializeDB(function(err){
    if (err) {
        console.log("Failed to connect DB.");
        console.log(err.message ? err.message : err);

    } else {
        app.startServer();
    }
});
