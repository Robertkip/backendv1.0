import RentPricing from "../models/rentalPriceModel.js";


export const CreateRentPrice = async(req, res) => {
    try {
        const { unit_type, rent_time_rate, unit_rent_price, apartment_id } = req.body;

        const rentPrice = await RentPricing.create({
            unit_type,
            rent_time_rate,
            unit_rent_price,
            apartment_id,
        });

        return res.status(201).json(rentPrice);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const getRentPriceByApartmentId = async(req, res) => {
    try {
        const { apartment_id } = req.params;

        const rentPrice = await RentPricing.findOne({
            where: { apartment_id },
        });

        if (!rentPrice) {
            return res.status(404).json({ message: "Rent price not found" });
        }

        return res.status(200).json(rentPrice);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const updateRentPrice = async(req, res) => {
    try {
        const { id } = req.params;
        const { unit_type, service_provider, provider_contact } = req.body;

        const rentPrice = await RentPricing.findByPk(id);

        if (!rentPrice) {
            return res.status(404).json({ message: "Rent price not found" });
        }

        rentPrice.unit_type = unit_type;
        rentPrice.service_provider = service_provider;
        rentPrice.provider_contact = provider_contact;

        await rentPrice.save();

        return res.status(200).json(rentPrice);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const deleteRentPrice = async(req, res) => {
    try {
        const { id } = req.params;

        const rentPrice = await RentPricing.findByPk(id);

        if (!rentPrice) {
            return res.status(404).json({ message: "Rent price not found" });
        }

        await rentPrice.destroy();

        return res.status(200).json({ message: "Rent price deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};