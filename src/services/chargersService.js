// src/services/chargersService.js
const { hasuraQuery } = require('./hasuraClient');

// prilagodi imena tabela i kolona po svojoj šemi
const CHARGERS_QUERY = `
  query GetChargingStationsWithConnectors {
  ChargingStations {
    id
    isOnline
    Location {
      id
      name
      address
      city
      state
      coordinates
    }
    Connectors(where: { connectorId: { _neq: 0 } }) {
      id
      connectorId
      status
    }
  }
}

`;

async function getChargers() {
  const data = await hasuraQuery(CHARGERS_QUERY);
  return data;
}


module.exports = { getChargers };
