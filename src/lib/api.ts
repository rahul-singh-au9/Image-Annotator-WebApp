import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://my-json-server.typicode.com/MostafaKMilly/demo",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Category {
  id: number | string;
  name: string;
}

export interface Image {
  id: number | string;
  name: string;
  categoryId: number | string;
  url?: string;
  uploadDate?: string;
  metadata?: {
    size?: number;
    resolution?: string;
  };
  category?: Category;
}

export interface Annotation {
  id: number | string;
  imageId: number | string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label?: string;
}
