const express = require("express");
const bodyPrser = require("body-parser");

const app = express();

app.use(bodyPrser.json());
app.use(bodyPrser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.send('Hello word');
});

require('./app/controllers/index')(app)


app.listen(3000);
