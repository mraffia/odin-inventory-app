const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true }, // reference to the associated book
  name: { type: String, required: true },
  desc: { type: String, required: true },
  price: { type: Number, required: true, min: 0, default: 0 },
  number_in_stock: { type: Number, required: true, min: 0, default: 0 },
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/item/${this._id}`;
});

// Export model
module.exports = mongoose.model("Item", ItemSchema);
