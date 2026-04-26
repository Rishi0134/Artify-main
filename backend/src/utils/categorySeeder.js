const Category = require("../models/Category");
const { ART_CATEGORIES } = require("../config/artCategories");

const syncArtCategories = async () => {
  for (const category of ART_CATEGORIES) {
    await Category.findOneAndUpdate(
      { name: category.name },
      {
        $set: {
          description: category.description,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  await Category.deleteMany({
    name: {
      $nin: ART_CATEGORIES.map((category) => category.name),
    },
  });
};

module.exports = {
  syncArtCategories,
};
