import PropertyLocation from "../models/propertyLocationModel.js";
import { detailRecordController, propertyParent } from "../helpers/detailRecordController.js";

// Where a property is.
const controller = detailRecordController({
  model: PropertyLocation,
  parent: propertyParent,
  fields: ["country", "county", "city_town", "latitude", "longitude", "address", "location_description"],
});

export const GetPropertyLocation = controller.list;
export const GetPropertyLocationById = controller.get;
export const CreatePropertyLocation = controller.create;
export const UpdatePropertyLocation = controller.update;
export const DeletePropertyLocation = controller.remove;
