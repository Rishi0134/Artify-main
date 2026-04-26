const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { ART_CATEGORIES } = require("../config/artCategories");
const { syncArtCategories } = require("../utils/categorySeeder");

const createCategory = asyncHandler(async (req, res) => {
  await syncArtCategories();
  sendResponse(res, {
    message: "Categories are system managed",
    data: ART_CATEGORIES,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  await syncArtCategories();
  const categories = await Category.find();
  const categoriesByName = new Map(categories.map((category) => [category.name, category]));
  const orderedCategories = ART_CATEGORIES.map((category) => categoriesByName.get(category.name)).filter(Boolean);

  sendResponse(res, {
    data: orderedCategories,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  sendResponse(res, {
    message: "Categories are fixed and cannot be edited",
    data: ART_CATEGORIES,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  sendResponse(res, {
    message: "Categories are fixed and cannot be deleted",
  });
});

module.exports = {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
};
