import ErrorHandler from "./ErrorHandler.js";

const baseUrl = process.env.HERE_MAPS_BASE_URL;
const apiKey = process.env.HERE_MAPS_API_KEY;

const getLocation = async (address) => {
  const url = `${baseUrl}/geocode?q=${address}&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items[0];
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

const geometry = async (address) => {
  try {
    const { position } = await getLocation(address);
    return {
      type: "Point",
      coordinates: [position.lng, position.lat],
    };
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

export { geometry, getLocation };
