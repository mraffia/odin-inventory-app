#! /usr/bin/env node

console.log('This script populates some test categories and items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []

function categoryCreate(name, desc, cb) {
  categoryDetail = { 
    name: name,
    desc: desc,
  }
    
  var category = new Category(categoryDetail);    
  category.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Category: ' + category);
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  });
}

function itemCreate(name, desc, price, number_in_stock, category, cb) {
  itemDetail = {
    name: name,
    desc: desc,
    price: price,
    number_in_stock: number_in_stock,
    category: category, 
  }
    
  var item = new Item(itemDetail);    
  item.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Item: ' + item);
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  });
}

function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate('Charms', 'Charms are gorgeous, mystical, one-of-a-kind accessories with a spark of power woven into their cores. ', callback);
        },
        function(callback) {
          categoryCreate('Adventure Gear', 'Items that will aid you in your travels.', callback)
        },
        function(callback) {
          categoryCreate('Keys', 'Keys found throughout Hallownest, unlocks interesting doors.', callback)
        }
        ],
        // optional callbackItems that will aid you in your travels
        cb);
}

function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Gathering Swarm', 'Do you find yourself leaving a lot of Geo behind as you hurry through the caverns? This charm will make sure that any loose change finds its way back to you.', 300, 1, [categories[0]], callback)
        },
        function(callback) {
          itemCreate('Stalwart Shell', 'Life in Hallownest can be tough, always taking hits and getting knocked around. This charm grants you more time to recover after taking damage. Useful if you need to escape from a tight spot.', 200, 1, [categories[0]], callback)
        },
        function(callback) {
          itemCreate('Heavy Blow', 'You enjoy smacking about foes with that nail of yours, right? With this charm equipped, you\'ll be able to send them flying further with every hit!', 350, 1, [categories[0]], callback)
        },
        function(callback) {
          itemCreate('Rancid Egg', 'I found this under the counter. Some creature must have laid it here while I was stuck down in the ruins. I suppose you could buy it? I won\'t miss its sour odour.', 60, 6, [categories[1]], callback)
        },
        function(callback) {
          itemCreate('Lumafly Lantern', 'What\'s more important? A light to guide your way, or a friend who\'ll stay by your side? Why not both? Take this bright little fellow as your companion and he\'ll light your way through the thickest darkness.', 1800, 1, [categories[1]], callback)
        },
        function(callback) {
          itemCreate('Elegant Key', 'An explorer found this fancy key floating in the waterways of the city far below us. I\'ve not cleaned it.', 800, 1, [categories[1], categories[2]], callback)
        },
        function(callback) {
          itemCreate('Simple Key', 'Simply, a simple key. It will fit a variety of locks, which is useful if you like to poke around in places you don\'t belong.', 950, 3, [categories[1], categories[2]], callback)
        }
        ],
        // Optional callback
        cb);
}

async.series([
    createCategories,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    }
    else {
        console.log('Items: ' + items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
