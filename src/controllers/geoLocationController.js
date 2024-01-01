import redis from 'redis';


export const userGeolocation = async (req, res) => {
    const { latitude, longitude } = req.body;

    // Create a new Redis client for each request
    const client = redis.createClient({
        legacyMode: true,
        host: "localhost",
        port: 6379,
    });

    await client.connect();
    console.log("Connected to Redis");
    if (!latitude || !longitude) {
        // Close the client and return a response
       await client.quit(() => {
            res.status(400).json({ error: 'Latitude and longitude are required.' });
        });
        return;
    }

    // Save coordinates to Redis
   await client.set('user_coordinates', JSON.stringify({ latitude, longitude }), (err, reply) => {
        // Close the client once the set operation is complete
        client.quit(() => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log(reply); // Reply from Redis (e.g., "OK")
                res.status(200).json({ success: 'Coordinates saved successfully.' });
            }
        });
    });
};
