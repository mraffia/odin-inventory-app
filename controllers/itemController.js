const Item = require("../models/item");
const Category = require("../models/category");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Items.
exports.item_list = (req, res, next) => {
  Item.find()
    .sort({ name: 1 })
    .exec(function (err, list_items) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("item_list", {
        title: "Item List",
        item_list: list_items,
      });
    });
};

// Display detail page for a specific Item.
exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec((err, item) => {
      if (err) {
        return next(err);
      }
      if (item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("item_detail", {
        title: item.name,
        item,
      });
    });
};

// Display Item create form on GET.
exports.item_create_get = (req, res, next) => {
  // Get all categories, which we can use for adding to our item.
  async.parallel(
    {
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("item_form", {
        title: "Create Item",
        categories: results.categories,
      });
    }
  );
};

// Handle Item create on POST.
exports.item_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("item_name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("item_desc", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be below 0").escape(),
  body("number_in_stock", "Stock must not be below 0").escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.item_name,
      desc: req.body.item_desc,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      async.parallel(
        {
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked.
          for (const category of results.categories) {
            if (item.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Create Item",
            categories: results.categories,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save item.
    item.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new item record.
      res.redirect(item.url);
    });
  },
];

// Display Item delete form on GET.
exports.item_delete_get = (req, res, next) => {
  Item.findById(req.params.id)
    .exec((err, item) => {
      if (err) {
        return next(err);
      }
      if (item == null) {
        // No results.
        res.redirect("/catalog/items");
      }
      // Successful, so render.
      res.render("item_delete", {
        title: 'Delete Item',
        item,
      });
    });
};

// Handle Item delete on POST.
exports.item_delete_post = (req, res, next) => {
  Item.findById(req.body.itemid)
    .exec((err, item) => {
      if (err) {
        return next(err);
      }
      if (item == null) {
        // No results.
        res.redirect("/catalog/items");
      }

      Item.findByIdAndRemove(req.body.itemid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to item list
        res.redirect("/catalog/items");
      });
    });
};

// Display Item update form on GET.
exports.item_update_get = (req, res, next) => {
  // Get item and categories for form.
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id)
          .populate("category")
          .exec(callback);
      },
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected categories as checked.
      for (const category of results.categories) {
        for (const itemCategory of results.item.category) {
          if (category._id.toString() === itemCategory._id.toString()) {
            category.checked = "true";
          }
        }
      }
      res.render("item_form", {
        title: "Update Item",
        categories: results.categories,
        item: results.item,
      });
    }
  );
};

// Handle Item update on POST.
exports.item_update_post = [
  // Convert the category to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("item_name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("item_desc", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be below 0").escape(),
  body("number_in_stock", "Stock must not be below 0").escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped/trimmed data and old id.
    const item = new Item({
      name: req.body.item_name,
      desc: req.body.item_desc,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      async.parallel(
        {
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked.
          for (const category of results.categories) {
            if (item.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Update Item",
            categories: results.categories,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to item detail page.
      res.redirect(theitem.url);
    });
  },
];
