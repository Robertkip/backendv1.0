import PropertyFacility from "../models/propertyFacilitiesModel.js";

export const GetPropertyFacility = async (req, res) => {
    try {
        const apartmentProperties = await PropertyFacility.findAll({
         where: {
            active: true
         }
        });
        return res.status(200).send({
           status: 200,
           message: 'OK',
           data: apartmentProperties 
        })
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
}

export const CreatePropertyFacility = async (req, res) => {
    try {
        const { facility_name, property_id } = req.body;

        const create = await PropertyFacility.create({
           facility_name,
           property_id
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

export const UpdatePropertyFacility = async (req, res) => {
    try {
        const { id } = req.params;
  
        const { facility_name } = req.body;

        const propertyFacitilities = await PropertyFacility.findByPk(id);

        if (!propertyFacitilities) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        propertyFacitilities.facility_name = facility_name;

        await propertyFacitilities.save();

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: propertyFacitilities
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
};

export const DeletePropertyFacility = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyFacitilities = await PropertyFacility.findByPk(id);

        if (!role) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        await propertyFacitilities.destroy();

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

export const GetPropertyFacilityById = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyFacitilities = await PropertyFacility.findByPk(id);

        if (!propertyFacitilities) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: propertyFacitilities
        });
    } catch (error) {

        return res.status(500).send({
            status: 500,
            message: "Internal server error",
    
        });
    }
}

