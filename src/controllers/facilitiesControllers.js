import Facility from "../models/facilitiesModel.js";

export const ApartmentFacility = async (req, res) => {
    try {
        const apartmentProperties = await Facility.findAll({
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

export const CreateApartmentFacility = async (req, res) => {
    try {
        const { facility_name, property_id } = req.body;

        const create = await Facility.create({
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

export const UpdateApartmentFacility = async (req, res) => {
    try {
        const { id } = req.params;
  
        const { facility_name } = req.body;

        const propertyFacitilities = await Facility.findByPk(id);

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

export const DeleteApartmentFacility = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyFacitilities = await Facility.findByPk(id);

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

export const GetApartmentFacilityById = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyFacitilities = await Facility.findByPk(id);

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

