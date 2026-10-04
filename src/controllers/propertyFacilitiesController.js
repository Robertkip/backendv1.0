import PropertyFacility from "../models/propertyFacilitiesModel.js";
import { detailRecordController, propertyParent } from "../helpers/detailRecordController.js";

// Facilities of a property.
const controller = detailRecordController({
  model: PropertyFacility,
  parent: propertyParent,
  fields: ["facility_name"],
});

export const GetPropertyFacility = controller.list;
export const GetPropertyFacilityById = controller.get;
export const CreatePropertyFacility = controller.create;
export const UpdatePropertyFacility = controller.update;
export const DeletePropertyFacility = controller.remove;
