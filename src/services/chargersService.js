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
    Connectors {
      id
      connectorId
      status
    }
  }
}

`;

async function getChargers() {
  const data = await hasuraQuery(CHARGERS_QUERY);
  console.log(data)
  return data;
}

// ovo će na kraju verovatno ići ka CitrineOS-u / tvojoj backend logici
async function startCharging(connectorId) {
  console.log('Start charging on connector', connectorId);

  // ovde ubaciš pravi poziv:
  // npr. REST ka svom backendu ili GraphQL mutation ka Hasuri
  // za sada mock:
  return { success: true, connectorId };
}

module.exports = { getChargers, startCharging };
