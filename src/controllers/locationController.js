import Location from "../models/locationModel.js";

export const GetLocations = async (req, res) => {
    try {
        const location = await Location.findAll({
         where: {
            active: true
         }
        });
        return res.status(200).send({
           status: 200,
           message: 'OK',
           data: location 
        })
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
}

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
        });
    }
}

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
        });
    }
};

export const DeleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        const apartmentLocation = await Location.findByPk(id);

        if (!role) {
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
        });
    }
}

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
    
        });
    }
}

