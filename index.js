const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

let items = ["Buy food", "Cook food", "Eat food"];


app.get("/", (req, res)=>{
    const today = new Date();
    const currentDay = today.getDay();
    
    const options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    }

    const day = today.toLocaleDateString("en-US", options);
    res.render("index", {kindOfDay: day, newItems: items});
});


app.post("/", (req, res)=>{
    const item = req.body.newItem;
    items.push(item);

    res.redirect("/");
});
app.listen(3000, ()=>console.log("Server has been started on port 3000"));