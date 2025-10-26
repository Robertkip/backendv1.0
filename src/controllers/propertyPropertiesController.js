import PropertyProperties from "../models/propertyProperties";

export const PropertyProperties = async (req, res) => {
    try {
        const propertyProperties = await PropertyProperties.findAll({
         where: {
            active: true
         }
        });
        return res.status(200).send({
           status: 200,
           message: 'OK',
           data: propertyProperties 
        })
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
}

export const CreateProperties = async (req, res) => {
    try {
        const { property_id, bedrooms, bathrooms} = req.body;

        const create = await PropertyProperties.create({
           property_id,
           bedrooms, 
           bathrooms,
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

export const UpdatePropertyProperties = async (req, res) => {
    try {
        const { id } = req.params;
    
        const { bedrooms, bathrooms} = req.body;

        const propertyProperties = await PropertyProperties.findByPk(id);

        if (!apartmentProperties) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        propertyProperties.bedrooms = bedrooms;
        propertyProperties.bathrooms = bathrooms;

        await propertyProperties.save();

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: propertyProperties
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Internal server error",
        });
    }
};

export const DeletePropertyProperties = async (req, res) => {
    try {
        const { id } = req.params;

        const apartmentProperties = await PropertyProperties.findByPk(id);

        if (!apartmentProperties) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        await apartmentProperties.destroy();

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

export const GetPropertyPropertiesById = async (req, res) => {
    try {
        const { id } = req.params;

        const apartmentProperties = await PropertyProperties.findByPk(id);

        if (!apartmentProperties) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        return res.status(200).send({
            status: 200,
            message: "OK",
            data: apartmentProperties
        });
    } catch (error) {

        return res.status(500).send({
            status: 500,
            message: "Internal server error",
    
        });
    }
}

