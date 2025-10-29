import axios from "axios";

export default async function handler(req, res) {
  const { id } = req.query;
  const API_URL = `https://course.summitglobal.id/students/${id}`;

  try {
    if (req.method === "PUT") {

      const response = await axios.put(API_URL, req.body);
      return res.status(200).json(response.data);
    }

    if (req.method === "DELETE") {

      const response = await axios.delete(API_URL);
      return res.status(200).json(response.data);
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.response?.data || error.message,
    });
  }
}
