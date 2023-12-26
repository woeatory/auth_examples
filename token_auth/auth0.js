const request = require('request');

const DOMAIN = 'dev-h328io6mo0psw3cs.us.auth0.com';
const CLIENT_ID = 'boHwWIS3iHymSzpn25DKa517XAenkfAa';
const CLIENT_SECRET = 'hcholBW6655-_hkF8Wt8VvMXYMHev20AlQbBDvepXJXcpU0_wA3KXPGd9wq_Ju0z';
const API_IDENTIFIER = 'https://dev-h328io6mo0psw3cs.us.auth0.com/api/v2/';

const auth0Login = (login, password) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `https://${DOMAIN}/oauth/token`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form:
      {
        grant_type: 'password',
        username: login,
        password: password,
        audience: API_IDENTIFIER,
        scope: 'offline_access',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }
    };
    request(options, (error, response, body) => {
      if (error) reject(error);
      resolve(body);
    });
  });
};

const auth0LoginRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `https://${DOMAIN}/oauth/token`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }
    };

    request(options, (error, response, body) => {
      if (error) reject(error);
      resolve(body);
    });
  });
};

module.exports = {
  auth0Login,
  auth0LoginRefreshToken
}