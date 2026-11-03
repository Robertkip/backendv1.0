import Facility from "../models/facilitiesModel.js";
import { apartmentParent, detailRecordController } from "../helpers/detailRecordController.js";

// Facilities (water, security, ...) of an apartment.
const controller = detailRecordController({
  model: Facility,
  parent: apartmentParent,
  fields: ["facility_name", "service_provider", "provider_contact"],
});

export const ApartmentFacility = controller.list;
export const GetApartmentFacilityById = controller.get;
export const CreateApartmentFacility = controller.create;
export const UpdateApartmentFacility = controller.update;
export const DeleteApartmentFacility = controller.remove;
