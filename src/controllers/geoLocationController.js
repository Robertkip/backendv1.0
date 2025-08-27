import redis from 'redis';
import util from 'util';

// Promisify Redis functions
const client = redis.createClient({
    legacyMode: true,
    host: "localhost",
    port: 6379,
});

const setAsync = util.promisify(client.set).bind(client);
const getAsync = util.promisify(client.get).bind(client);

export const userGeolocation = async (req, res) => {
    const { id, latitude, longitude, timestamp } = req.body;

    try {
        // Connect to Redis
        await client.connect();
        console.log("Connected to Redis");

        if (!id || !latitude || !longitude || !timestamp) {
            throw new Error('Latitude and longitude are required.');
        }

        // Save coordinates to Redis
        await setAsync('user_coordinates', JSON.stringify({ id, latitude, longitude, timestamp }));
        console.log('Coordinates saved successfully.');

        res.status(200).json({ id, latitude, longitude, timestamp});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Disconnect from Redis
        await client.quit();
    }
};

export const getUserCoordinates =async (req, res) => {

    // Create a new Redis client for each request
    const client = redis.createClient({
        legacyMode: true,
        host: "localhost",
        port: 6379,
    });

    await client.connect();

    // Retrieve coordinates from Redis
   await client.get('user_coordinates', (err, reply) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!reply) {
            return res.status(404).json({ error: 'User coordinates not found.' });
        }

        const { id, latitude, longitude } = JSON.parse(reply);
        res.status(200).json({ id, latitude, longitude });
    });
};
