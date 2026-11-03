import ApartementProperties from "../models/apartmentProperties.js";
import { apartmentParent, detailRecordController } from "../helpers/detailRecordController.js";

// Unit counts of an apartment.
const controller = detailRecordController({
  model: ApartementProperties,
  parent: apartmentParent,
  fields: ["number_of_units", "number_of_one_bd", "number_of_two_bd", "number_of_three_bd", "number_of_four_bd"],
});

export const GetApartementProperties = controller.list;
export const GetApartementPropertiesById = controller.get;
export const CreateApartementProperties = controller.create;
export const UpdateApartementProperties = controller.update;
export const DeleteApartementProperties = controller.remove;
