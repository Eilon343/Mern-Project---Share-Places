const express = require("express");
const { check } = require("express-validator");
const placesController = require("../controllers/places-controller");

const router = express.Router();

//Getting a place by id
router.get("/:pid", placesController.getPlaceById);

//Getting places by user id
router.get("/user/:uid", placesController.getPlacesByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty().withMessage("Title is empty, must fill"),
    check("description")
      .isLength({ min: 5 })
      .withMessage("must be at leasts 5 chars long"),
  ],
  placesController.createPlace
);

router.patch(
  "/:pid",
  [
    check("title").not().isEmpty().withMessage("Title is empty, must fill"),
    check("description")
      .isLength({ min: 5 })
      .withMessage("must be at leasts 5 chars long"),
    // check("address").not().isEmpty().withMessage("address is empty, must fill"),
  ],
  placesController.updatePlace
);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;
