import ApartementProperties from "../models/apartmentProperties";

export const ApartementProperties = async (req, res) => {
    try {
        const apartmentProperties = await ApartementProperties.findAll({
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

export const CreateApartementProperties = async (req, res) => {
    try {
        const { number_of_units, apartment_id, number_of_one_bd, number_of_two_bd, number_of_three_bd, number_of_four_bd  } = req.body;

        const create = await ApartementProperties.create({
           number_of_units,
           apartment_id, 
           number_of_one_bd, 
           number_of_two_bd, 
           number_of_three_bd, 
           number_of_four_bd 
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

export const UpdateApartementProperties = async (req, res) => {
    try {
        const { id } = req.params;
        const { number_of_units, number_of_one_bd, number_of_two_bd, number_of_three_bd, number_of_four_bd  } = req.body;

        const apartmentProperties = await ApartementProperties.findByPk(id);

        if (!apartmentProperties) {
            return res.status(404).send({
                status: 404,
                message: "Data Not Found",
                data: null
            });
        }

        apartmentProperties.number_of_units = number_of_units;
        apartmentProperties.number_of_one_bd = number_of_one_bd;
        apartmentProperties.number_of_two_bd = number_of_two_bd;
        apartmentProperties.number_of_three_bd = number_of_three_bd;
        apartmentProperties.number_of_four_bd = number_of_four_bd;

        await apartmentProperties.save();

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
};

export const DeleteApartementProperties = async (req, res) => {
    try {
        const { id } = req.params;

        const apartmentProperties = await ApartementProperties.findByPk(id);

        if (!role) {
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

export const GetApartementPropertiesById = async (req, res) => {
    try {
        const { id } = req.params;

        const apartmentProperties = await ApartementProperties.findByPk(id);

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

