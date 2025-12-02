import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export function useCategories() {
  async function fetchCategories() {
    return await axios.get(`${apiUrl}/categories`);
  }

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return query; 
}
