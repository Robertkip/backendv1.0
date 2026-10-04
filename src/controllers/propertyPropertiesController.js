import PropertyProperties from "../models/propertyProperties.js";
import { detailRecordController, propertyParent } from "../helpers/detailRecordController.js";

// Rooms of a property.
const controller = detailRecordController({
  model: PropertyProperties,
  parent: propertyParent,
  fields: ["bedrooms", "bathrooms", "kitchen"],
});

export const GetPropertyProperties = controller.list;
export const GetPropertyPropertiesById = controller.get;
export const CreateProperties = controller.create;
export const UpdatePropertyProperties = controller.update;
export const DeletePropertyProperties = controller.remove;
