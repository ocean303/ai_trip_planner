// import axios from "axios";

// export const GetPlaceDetails = async () => {
//   try {
//     const response = await axios.get(
//       "https://places.googleapis.com/v1/places:searchText",
//       {
//         headers: {
//           Authorization: 'AIzaSyBPRzZN0cd_I-1DPllUVQv0Qz7rFvLhoDs',
//           // Include other headers if necessary
//         },
//       }
//     );
//     console.log(response.data);
//   } catch (error) {
//     console.error(
//       "Error fetching data:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };

import axios from "axios";
const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

const config = {
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
    "X-Goog-FieldMask": ["places.photos", "places.displayName", "places.id"],
  },
};

export const GetPlaceDetails = (data) => axios.post(BASE_URL, data, config);
