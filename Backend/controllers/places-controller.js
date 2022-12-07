const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const convertAddressToCords = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const fs = require("fs");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let foundPlace;
  try {
    foundPlace = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }
  //Handeling id not exists error
  if (!foundPlace) {
    return next(
      (error = new HttpError(
        "Could not find a place for the provided id.",
        404
      ))
    );
  }

  res.json({ foundPlace: foundPlace.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find places", 500)
    );
  }

  //Handling id not exists error
  if (!userWithPlaces || userWithPlaces.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }

  res.send({
    Places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(res.status(422).json(errors));
  }
  const { title, description, address, creator } = req.body;

  //converting address to coordinates with google geocode api
  let coordinates;
  try {
    coordinates = await convertAddressToCords(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title: title,
    description: description,
    address: address,
    location: coordinates,
    image: req.file.path,
    creator: creator,
  });

  //finding the user that was creating this place
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id", 404));
  }

  //code block for adding places to a user places array which provided by user id
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    //the code in try block will be executed only if it gets here
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could now update place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id", 404));
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    //the code in try block will be executed only if it gets here
    await session.commitTransaction();
  } catch (error) {
    return new HttpError(
      "Something went wrong, could now deleted a place",
      500
    );
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
