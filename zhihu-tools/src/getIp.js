const request = require('request-promise');
const get_ip_url = require('../config/getIp');

async function getIp () {
  let back = '';
  await request(get_ip_url, function (error, response, body) {
    if(response && (response.statusCode === 200)) {
      back = body;
    }
  });
  return back;
}
module.exports = getIp
