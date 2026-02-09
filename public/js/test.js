const axios = require('axios');

// Route for Journey Builder execution
exports.execute = async (req, res) => {
    try {
        // 1. Get the current contact's data from Journey Builder
        const { id, fname, lname, email } = req.body.inArguments[0];

        // 2. Get Access Token (Use your Client ID/Secret stored in Env Vars)
        const authResponse = await axios.post(`https://${process.env.SUBDOMAIN}://`, {
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        });
        const token = authResponse.data.access_token;

        // 3. Upsert data into DE2_vineeth (Hardcoded target)
        // Primary Key 'id' is used in the URL path for upsert
        const targetDEKey = 'DE2_vineeth'; 
        const upsertUrl = `https://${process.env.SFMC_SUBDOMAIN}://{targetDEKey}/rows/id:${id}`;

        await axios.put(upsertUrl, {
            values: {
                "fname": fname,
                "lname": lname,
                "email": email
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Successfully copied ${id} to DE2_vineeth`);
        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Error during execution:', error.message);
        return res.status(500).send('Internal Server Error');
    }
};
