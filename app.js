const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect('mongodb+srv://admin-kartik:2001@cluster0.1emkx.mongodb.net/TodoListDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set("view engine", "ejs");

const itemSchema = new mongoose.Schema({
  name: String
});



const Item = mongoose.model('Item', itemSchema);
const item1 = new Item({
  name: "Welcome to your to do list"
});
const item2 = new Item({
  name: "Hit + button to add new item"
});
const item3 = new Item({
  name: "<-- hit ti delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model('List', listSchema);
// Item.deleteMany({
//   item: ""
// }, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Deleted Successfully");
//   }
// });
//
// Item.findByIdAndDelete(id, (err) =>{
//     console.log('deleting project', id)
//     if(err){
//         console.log(err);
//     }

// var today = new Date();
// var options = {
//   weekday : "long",
//   month: 'long',
//    day: 'numeric'
//  };
// Item.deleteMany({
//   name: "Welcome to your to do list"
// }, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Deleted Successfully");
//   }
// });
// Item.deleteMany({
//   name: "Hit + button to add new item"
// }, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Deleted Successfully");
//   }
// });
// Item.deleteMany({
//   name: "<-- hit ti delete an item"
// }, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Deleted Successfully");
//   }
// });

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
if(foundItems.length === 0){

  Item.insertMany(defaultItems, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully uploaded default items");
    }
  });
  res.redirect("/");

} else{
    res.render("list", {
      listTitle: "Today",
      newItems: foundItems
    });
  }
  });



});


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newItems: foundList.items});
      }
    }
  });
});
// app.get("/:customListName",function(req,res){
//   const customListName = req.params.customListName;
//
//   List.findOne({Name:customListName},function(err,foundList){
//     if(!err){
//       if(!foundList){
//       //create new list
//       const list = new List({
//         name: customListName,
//         items: defaultItems
//       });
//       list.save();
//
//       res.redirect("/"+ customListName);
//     }else{
//       //show found listTitle
//       console.log(customListName);
//       res.render("list", {listTitle: foundList.name,  newItems: foundList.items  });
//         // res.redirect("/"+ customListName);
//     }
//       }
//   });
// });

// app.post("/Work",function(req,res){
//   var item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/Work");
// });

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

    const item = new Item({
      name: itemName
    });
    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    }

});

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/Work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }


  app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }


  });

  let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Successfully connected to server");
});
