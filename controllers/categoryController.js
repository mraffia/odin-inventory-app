const Category = require("../models/category");
const Item = require("../models/item");

const async = require("async");

exports.index = (req, res, next) => {
  async.parallel(
    {
      category_count(callback) {
        Category.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      item_count(callback) {
        Item.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Sly's Shop (Inventory App)",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Categories.
exports.category_list = (req, res, next) => {
  Category.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("category_list", { title: "Category List", category_list: list_categories });
    });
};

// Display detail page for a specific Category.
exports.category_detail = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Category detail: ${req.params.id}`);
};

// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category create GET");
};

// Handle Category create on POST.
exports.category_create_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category create POST");
};

// Display Category delete form on GET.
exports.category_delete_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category delete GET");
};

// Handle Category delete on POST.
exports.category_delete_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category delete POST");
};

// Display Category update form on GET.
exports.category_update_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category update GET");
};

// Handle Category update on POST.
exports.category_update_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category update POST");
};
