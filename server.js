const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());

const SFMC_SUBDOMAIN = 'YOUR_SUBDOMAIN';
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

const EVENT_DEFINITION_KEY = 'SECOND_JOURNEY_EVENT';

async function getAccessToken() {

    const response = await axios.post(
        `https://${SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`,
        {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }
    );

    return response.data.access_token;
}

app.post('/execute', async (req, res) => {

    try {

        console.log('Journey Activity Payload:', req.body);

        const inArguments = req.body.inArguments[0];

        const contactKey = inArguments.contactKey;
        const emailAddress = inArguments.emailAddress;

        const accessToken = await getAccessToken();

        await axios.post(
            `https://${SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/interaction/v1/events`,
            {
                ContactKey: contactKey,
                EventDefinitionKey: EVENT_DEFINITION_KEY,
                Data: {
                    EmailAddress: emailAddress
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Journey Triggered Successfully');

        res.status(200).send({
            status: 'ok'
        });

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.status(500).send({
            error: 'Failed to trigger journey'
        });
    }
});

app.post('/publish', (req, res) => {
    res.status(200).send({ status: 'published' });
});

app.post('/validate', (req, res) => {
    res.status(200).send({ status: 'validated' });
});

app.post('/stop', (req, res) => {
    res.status(200).send({ status: 'stopped' });
});

app.get('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
