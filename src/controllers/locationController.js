import { Op } from "sequelize";
import Location from "../models/locationModel.js";

const normalizeLocationFilter = (value) => (typeof value === "string" ? value.trim() : "");

const buildLocationWhere = (query = {}) => {
    const where = {};
    const searchTerm = normalizeLocationFilter(
        query.location ?? query.city_town ?? query.county ?? query.country ?? query.name ?? query.query
    );

    if (searchTerm) {
        where[Op.or] = [
            { city_town: { [Op.like]: `%${searchTerm}%` } },
            { county: { [Op.like]: `%${searchTerm}%` } },
            { country: { [Op.like]: `%${searchTerm}%` } },
            { address: { [Op.like]: `%${searchTerm}%` } },
        ];
    }

    if (query.apartment_id) {
        where.apartment_id = query.apartment_id;
    }

    if (query.property_id) {
        where.property_id = query.property_id;
    }

    if (query.active !== undefined) {
        where.active = query.active === "true" || query.active === true;
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
        const where = buildLocationWhere(req.query);
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
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message,
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
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message,
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
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const CreateLocation = async (req, res) => {
    try {
        const { country, apartment_id, county, city_town, latitude, longitude, address, location_description } = req.body;

        const create = await Location.create({
           country,
           apartment_id,
           county,
           city_town,
           latitude,
           longitude,
           address,
           location_description,
           createdAt: Date.now(),
           updatedAt: Date.now()
        });

        return res.status(201).send({
            status: 201,
            message: "Created",
            data: create
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const UpdateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { country, county, city_town, latitude, longitude, address, location_description } = req.body;

        const apartmentLocation = await Location.findByPk(id);

        if (!apartmentLocation) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        apartmentLocation.country = country;
        apartmentLocation.county = county;
        apartmentLocation.city_town = city_town;
        apartmentLocation.latitude = latitude;
        apartmentLocation.longitude = longitude;
        apartmentLocation.address = address;
        apartmentLocation.location_description = location_description;

        await apartmentLocation.save();

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: apartmentLocation
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const DeleteLocation = async (req, res) => {
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

        await apartmentLocation.destroy();

        return res.status(200).send({
            status: 200,
            message: "Deleted",
            data: null
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

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
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

