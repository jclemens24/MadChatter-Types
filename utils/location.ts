import axios from 'axios';
import { AppError } from './appError';

const getCoordsForAddress = async (address: string) => {
  const res = await axios({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  });

  const data = await res.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    throw new AppError('Could not find a location for the given address', 404);
  }
  const coordinates = data.results[0].geometry.location;
  return coordinates;
};

export default getCoordsForAddress;
