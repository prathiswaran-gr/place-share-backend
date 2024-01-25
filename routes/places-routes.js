const express = require("express");
const { check } = require("express-validator");
const placeController = require("../controllers/places-controller");

const route = express.Router();

route.get("/user/:uid", placeController.getPlacesByUserId);

route.get("/:pid", placeController.getPlaceByPlaceId);

route.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }, check("address").not().isEmpty()),
  ],
  placeController.createNewPlace
);

route.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeController.updatePlace
);

route.delete("/:pid", placeController.deletePlace);

module.exports = route;
