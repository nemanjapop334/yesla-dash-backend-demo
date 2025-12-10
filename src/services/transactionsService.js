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
  // console.log(data.Transactions)
  return data.Transactions;
}


async function stopTransaction({ transactionId, identifier, timeoutMs = 10000 }) {
  if (!CITRINE_URL) {
    throw new Error('CITRINE_URL is not set');
  }
  if (!transactionId) {
    throw new Error('remoteStopTransaction: transactionId is required');
  }
  if (!identifier) {
    throw new Error('remoteStopTransaction: identifier is required');
  }
  if (tenantId == null) {
    throw new Error('remoteStopTransaction: tenantId is required');
  }

  const url = `${CITRINE_URL}/ocpp/1.6/evdriver/remoteStopTransaction`;

  try {
    const resp = await axios.post(
      url,
      { transactionId },
      { params: { identifier, tenantId }, timeout: timeoutMs }
    );

    return { ok: true, status: resp.status, data: resp.data };
  } catch (err) {

    throw err;
  }
}



module.exports = { getTransactions, stopTransaction };
