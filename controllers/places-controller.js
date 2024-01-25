const HttpError = require("../models/httpError");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const UserModel = require("../models/user");
const PlaceModel = require("../models/place");

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let places;
  // try {
  //   places = await PlaceModel.find({ creator: userId });
  // } catch (e) {
  //   return next(new HttpError("Couldn't find place by user id", 500));
  // }

  // if (!places || places.length == 0) {
  //   return next(
  //     new HttpError("Couldn't find a place for the given user id", 404)
  //   );
  // }
  let userPlaces;
  try {
    userPlaces = await UserModel.findById(userId).populate("places");
  } catch (e) {
    return next(new HttpError("Couldn't find place by user id", 500));
  }

  if (!userPlaces || userPlaces.places.length == 0) {
    return next(new HttpError("No place found for the given user id", 404));
  }

  res.json({
    places: userPlaces.places.map((p) => p.toObject({ getters: true })),
  });
};

const getPlaceByPlaceId = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await PlaceModel.findById(placeId).exec();
  } catch (e) {
    const error = new HttpError("Couldn't find a place with the given id", 500);
    return next(error);
  }

  if (!place) {
    return next(
      new HttpError("Couldn't find a place for the given place id", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const createNewPlace = async (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid input passed", 422));
  }
  let user;
  try {
    user = await UserModel.findById(creator);
  } catch (error) {
    const err = new HttpError("Something went wrong", 404);
    return next(err);
  }
  if (!user) {
    const err = new HttpError("User id not found", 404);
    return next(err);
  }
  const newPlace = new PlaceModel({
    title,
    description,
    location: coordinates,
    address,
    creator,
  });
  try {
    const session = await mongoose.startSession();

    session.startTransaction();
    newPlace.save({ session: session });
    await user.places.push(newPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (e) {
    const error = new HttpError("Couldn't create place", 500);
    return next(error);
  }

  res.status(201).json({ place: newPlace.toObject({ getters: true }) });
};

const updatePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  const { title, description, location, address, creator } = req.body;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid input passed", 422);
  }
  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (e) {
    return next(new HttpError("Something went wrong!", 500));
  }
  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong! Place cannnot be updated", 500)
    );
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await PlaceModel.findById(placeId).populate("creator");
  } catch (error) {
    return next(new HttpError("Something went wrong", 500));
  }
  if (!place) {
    return next(new HttpError("Couldn't find a place for the given id", 404));
  }
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await place.deleteOne({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });

    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Invalid delete request (No given place id found)", 500)
    );
  }
  res.json({ message: "Place deleted" });
};
exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createNewPlace = createNewPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
