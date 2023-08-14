import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const PORT = process.env.PORT || 3000;

const app = express();
let items = ["Buy food", "Cook food", "Eat food"];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

// explicitly tell express to serve the public folder
app.use(express.static("public"));

mongoose.set("strictQuery", false);

// connect to mongodb atlas server
await mongoose.connect("mongodb+srv://Ankit2928:7R7BrCmNj1emIsQ9@cluster0.lhgahvp.mongodb.net/todolistDB");

// create a items schema
const itemsSchema = new mongoose.Schema({
    name: String
});

// create a new item model
const Item = mongoose.model("Item", itemsSchema);

// create three documents of item schema
const item1 = new Item({
    name: "Welcome to yout todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});


// create a new List schema
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

// create a list model
const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];


app.get("/", async (req, res)=>{
    const result = await Item.find({}); 
    if(result.length === 0) {
        await Item.insertMany(defaultItems);
    }
    res.render("list", {listTitle: "Today", newItems: result});
});

app.post("/", async (req, res)=>{
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const comingItem = new Item({
        name: itemName
    });
    
    if(listName === "Today") {
        await comingItem.save();
        res.redirect("/");
    } else {
        const listDoc = await List.findOne({name: listName});
        listDoc.items.push(comingItem);
        await listDoc.save();
        res.redirect("/" + listName);
    }
});

app.post("/delete", async (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today") {
        await Item.deleteOne({_id: checkedItemId});
        res.redirect("/");
    } else {
        const condition = {name: listName};
        const l = await List.findOneAndUpdate(condition, {$pull: {items: {_id: checkedItemId}}});
        res.redirect("/" + listName);
    }
});

app.get("/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    const isFound = await List.findOne({name: customListName});
    if(!isFound) {
        // create a new document of list schema
        // if it doesn't exist
        const list = new List({
            name: customListName,
            items: defaultItems
        });

        await list.save();
        res.redirect("/" + customListName);
    } else {
        res.render("list.ejs", {listTitle: customListName, newItems: isFound.items});
    }  
});


app.listen(PORT, ()=>console.log("Server is running on port 3000..."));