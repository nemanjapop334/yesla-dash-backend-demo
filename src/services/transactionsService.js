const CITRINE_URL = process.env.CITRINE_URL;
const tenantId = Number(process.env.TENANT_ID || 1);
const axios = require('axios');

const { hasuraQuery } = require('./hasuraClient');

const TRANSACTIONS_QUERY = `
 query GetTransactions {
  Transactions(order_by: { createdAt: desc }) {
    id
    stationId
    transactionId
    isActive
    chargingState
    timeSpentCharging
    totalKwh
    stoppedReason
    totalCost
    createdAt
    updatedAt

    StartTransaction {
      id
      timestamp
      meterStart
      stationId

      IdToken {
        id
        idToken
        type
      }

      Connector {
        connectorId
      }
    }

    StopTransaction {
      id
      timestamp
    }
      
    ChargingStation {
      id
      locationId
      Location {
        name
        address
        city
      }
    }
  }
}
`;

async function getTransactions() {
  const data = await hasuraQuery(TRANSACTIONS_QUERY);
  return data.Transactions;
}


module.exports = { getTransactions };
