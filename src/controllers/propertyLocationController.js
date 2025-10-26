import PropertyLocation from "../models/propertyLocationModel";

export const PropertyLocation = async (req, res) => {
    try {
        const propertyLocation = await PropertyLocation.findAll({
         where: {
            active: true
         }
        });
        return res.status(200).send({
           status: 200,
           message: 'OK',
           data: propertyLocation 
        })
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
}

export const CreatePropertyLocation = async (req, res) => {
    try {
        const { country, property_id, county, city_town, latitude, longitude, address, location_description } = req.body;

        const create = await PropertyLocation.create({
           country,
           property_id, 
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
        });
    }
}

export const UpdatePropertyLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { country, county, city_town, latitude, longitude, address, location_description } = req.body;

        const propertyLocation = await PropertyLocation.findByPk(id);

        if (!propertyLocation) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        propertyLocation.country = country;
        propertyLocation.county = county;
        propertyLocation.city_town = city_town;
        propertyLocation.latitude = latitude;
        propertyLocation.longitude = longitude;
        propertyLocation.address = address;
        propertyLocation.location_description = location_description;

        await propertyLocation.save();

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: propertyLocation
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
};

export const DeletePropertyLocation = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyLocation = await PropertyLocation.findByPk(id);

        if (!role) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        await propertyLocation.destroy();

        return res.status(200).send({
            status: 200,
            message: "Deleted",
            data: null
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
}

export const GetPropertyLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyLocation = await PropertyLocation.findByPk(id);

        if (!propertyLocation) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: propertyLocation
        });
    } catch (error) {

        return res.status(500).send({
            status: 500,
            message: "Internal server error",
    
        });
    }
}

