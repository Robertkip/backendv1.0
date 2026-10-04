import { Op } from "sequelize";
import Location from "../models/locationModel.js";
import { apartmentParent, detailRecordController } from "../helpers/detailRecordController.js";

// apartment_locations has no property_id or active column: property locations
// live in their own table (/api/v1/property-locations).
class InvalidQueryError extends Error {}

const normalizeLocationFilter = (value) => (typeof value === "string" ? value.trim() : "");

const buildLocationWhere = (query = {}) => {
    const where = {};
    const searchTerm = normalizeLocationFilter(
        query.location ?? query.city_town ?? query.county ?? query.country ?? query.name ?? query.query
    );

    if (searchTerm) {
        where[Op.or] = [
            { city_town: { [Op.iLike]: `%${searchTerm}%` } },
            { county: { [Op.iLike]: `%${searchTerm}%` } },
            { country: { [Op.iLike]: `%${searchTerm}%` } },
            { address: { [Op.iLike]: `%${searchTerm}%` } },
        ];
    }

    if (query.apartment_id !== undefined) {
        const apartmentId = Number(query.apartment_id);
        if (!Number.isInteger(apartmentId)) {
            throw new InvalidQueryError("apartment_id must be a number");
        }
        where.apartment_id = apartmentId;
    }

    return where;
};

const groupLocationsByName = (records = []) => {
    const groups = new Map();

    records.forEach((record) => {
        const groupName = record.city_town || record.county || record.country || "Unknown location";
        const uniqueKey = groupName.trim().toLowerCase();

        if (!groups.has(uniqueKey)) {
            groups.set(uniqueKey, {
                name: groupName,
                key: uniqueKey,
                count: 0,
                records: [],
                sampleAddress: record.address || null,
            });
        }

        const group = groups.get(uniqueKey);
        group.count += 1;
        group.records.push(record);

        if (!group.sampleAddress && record.address) {
            group.sampleAddress = record.address;
        }
    });

    return Array.from(groups.values()).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
};

export const GetLocations = async (req, res) => {
    try {
        let where;
        try {
            where = buildLocationWhere(req.query);
        } catch (error) {
            if (!(error instanceof InvalidQueryError)) throw error;
            return res.status(400).send({ status: 400, message: error.message, data: [] });
        }
        const locations = await Location.findAll({
            where,
            order: [["city_town", "ASC"], ["county", "ASC"], ["address", "ASC"]],
        });

        const shouldGroup = req.query.grouped === "true" || req.query.group === "true";

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: shouldGroup ? groupLocationsByName(locations) : locations,
            total: locations.length,
        });
    } catch (error) {
        console.error("Location query failed:", error);
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
};

export const SearchLocations = async (req, res) => {
    try {
        const search = normalizeLocationFilter(req.query.search || req.query.query || req.query.location);

        if (!search) {
            return res.status(400).send({
                status: 400,
                message: "Search query is required",
                data: [],
            });
        }

        const locations = await Location.findAll({
            where: buildLocationWhere({ location: search }),
            order: [["city_town", "ASC"], ["county", "ASC"], ["address", "ASC"]],
        });

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: locations,
            total: locations.length,
        });
    } catch (error) {
        console.error("Location query failed:", error);
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
};

export const GetLocationsByName = async (req, res) => {
    try {
        const locationName = normalizeLocationFilter(req.params.name);

        if (!locationName) {
            return res.status(400).send({
                status: 400,
                message: "Location name is required",
                data: [],
            });
        }

        const locations = await Location.findAll({
            where: buildLocationWhere({ location: locationName }),
            order: [["city_town", "ASC"], ["county", "ASC"], ["address", "ASC"]],
        });

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: locations,
            total: locations.length,
        });
    } catch (error) {
        console.error("Location query failed:", error);
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
};

const writer = detailRecordController({
    model: Location,
    parent: apartmentParent,
    fields: ["country", "county", "city_town", "latitude", "longitude", "address", "location_description"],
});

export const CreateLocation = writer.create;
export const UpdateLocation = writer.update;
export const DeleteLocation = writer.remove;

export const GetLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const apartmentLocation = await Location.findByPk(id);

        if (!apartmentLocation) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: apartmentLocation
        });
    } catch (error) {
        console.error("Location query failed:", error);
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
};

