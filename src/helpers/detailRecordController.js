import Apartment from "../models/apartmentModel.js";
import Property from "../models/propertyModel.js";
import { canModify, canModifyApartment, isAdmin, sendForbidden } from "./ownership.js";

// Details of a listing (amenities, facilities, location) belong to the
// apartment or property they describe. Anyone may read them; only the
// listing's owner or an admin may create, change or delete them.
export const apartmentParent = {
  key: "apartment_id",
  model: Apartment,
  canModify: canModifyApartment,
};

export const propertyParent = {
  key: "property_id",
  model: Property,
  // Properties created before owners were recorded have no agent_id: admins only.
  canModify: async (user, property) => canModify(user, property.agent_id),
};

const reply = (res, status, message, data = null) => res.status(status).send({ status, message, data });

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

const pick = (body, fields) =>
  Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));

// Builds list/get/create/update/delete handlers for one detail model.
// `fields` are the columns a request body may set (the parent key aside).
export const detailRecordController = ({ model, parent, fields }) => {
  // Loads the parent listing and checks the user may change it. Sends the
  // error response and returns false when not.
  const authorize = async (req, res, parentId) => {
    // Older records may not name a listing: only an admin may change those.
    if (parentId == null && req.method !== "POST") {
      if (isAdmin(req.user)) return true;
      sendForbidden(res);
      return false;
    }
    const id = parseId(parentId);
    if (id === null) {
      reply(res, 400, `${parent.key} must be a number`);
      return false;
    }
    const listing = await parent.model.findByPk(id);
    if (!listing) {
      reply(res, 404, "Listing not found");
      return false;
    }
    if (!(await parent.canModify(req.user, listing))) {
      sendForbidden(res);
      return false;
    }
    return true;
  };

  const findRecord = async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      reply(res, 400, "id must be a number");
      return null;
    }
    const record = await model.findByPk(id);
    if (!record) {
      reply(res, 404, "Data Not Found");
      return null;
    }
    return record;
  };

  return {
    // Optional ?apartment_id= / ?property_id= narrows the list to one listing.
    list: async (req, res) => {
      const where = {};
      if (req.query[parent.key] !== undefined) {
        const parentId = parseId(req.query[parent.key]);
        if (parentId === null) {
          return reply(res, 400, `${parent.key} must be a number`);
        }
        where[parent.key] = parentId;
      }
      return reply(res, 200, "OK", await model.findAll({ where, order: [["id", "ASC"]] }));
    },

    get: async (req, res) => {
      const record = await findRecord(req, res);
      if (record) {
        reply(res, 200, "OK", record);
      }
    },

    create: async (req, res) => {
      if (!(await authorize(req, res, req.body[parent.key]))) return;
      const record = await model.create({ ...pick(req.body, fields), [parent.key]: parseId(req.body[parent.key]) });
      return reply(res, 201, "Created", record);
    },

    update: async (req, res) => {
      const record = await findRecord(req, res);
      if (!record || !(await authorize(req, res, record[parent.key]))) return;
      // Moving a record to another listing needs rights over that one too.
      if (req.body[parent.key] !== undefined && !(await authorize(req, res, req.body[parent.key]))) return;
      await record.update(pick(req.body, [...fields, parent.key]));
      return reply(res, 200, "OK", record);
    },

    remove: async (req, res) => {
      const record = await findRecord(req, res);
      if (!record || !(await authorize(req, res, record[parent.key]))) return;
      await record.destroy();
      return reply(res, 200, "Deleted");
    },
  };
};
