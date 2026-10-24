// Throw from anywhere; the error middleware turns it into a JSON response.
export default function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
