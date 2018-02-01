

const app = require("./app");

app.initializeDB(function(err){
    if (err) {
        console.log("Failed to connect DB.");
        console.log(err.message ? err.message : err);

    } else {
        const server = app.listen(app.get("port"), () => {
            console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
            console.log("  Press CTRL-C to stop\n");
        });
    }
});

