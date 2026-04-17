import twilio from 'twilio';

let twilioInstance = null;

const initializeTwilio = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error(
      'Missing required Twilio credentials in environment variables: ' +
      'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID'
    );
  }

  const client = twilio(accountSid, authToken);
  return {
    client,
    verifyService: client.verify.services(serviceSid),
  };
};

/**
 * Get Twilio client instance (lazy initialized)
 */
export const getTwilioClient = () => {
  if (!twilioInstance) {
    twilioInstance = initializeTwilio();
  }
  return twilioInstance;
};

// For backward compatibility - Proxy pattern for lazy loading
export const twilioClient = new Proxy({}, {
  get: (target, prop) => {
    return getTwilioClient()[prop];
  }
});
