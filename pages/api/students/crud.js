
import axios from "axios";

const REMOTE_API = "https://course.summitglobal.id/students";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const response = await axios.get(REMOTE_API);
      res.status(200).json(response.data);
    } catch (error) {
      console.error("GET error:", error.message);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  }

  if (req.method === "POST") {
    try {
      const response = await axios.post(REMOTE_API, req.body);
      res.status(200).json(response.data);
    } catch (error) {
      console.error("POST error:", error.message);
      res.status(500).json({ message: "Failed to add student" });
    }
    }
}
