const ga4mp = require('ga4-mp')
/**
 * ga4 measurement protocol
 * @param {string} clientId 
 * @param {array} events 
 */
function send(clientId, events) {
  const ga4 = ga4mp.createClient(process.env['API_SECRET'], process.env['MEASUREMENT_ID'], clientId)
  ga4.send(events)
  console.log('ga4 send')
}

module.exports = { send }
