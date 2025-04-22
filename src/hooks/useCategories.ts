import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface Category {
  id: number;
  name: string;
}

const STORAGE_KEYS = {
  api: "categories_api",
  local: "categories_local",
};

interface LocalChanges {
  created: Category[];
  updated: Category[];
  deleted: number[];
}

// LocalStorage helpers
const getAPIData = (): Category[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.api) || "[]");
};

const setAPIData = (data: Category[]) => {
  localStorage.setItem(STORAGE_KEYS.api, JSON.stringify(data));
};

const getLocalChanges = (): LocalChanges => {
  if (typeof window === "undefined") return { created: [], updated: [], deleted: [] };
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.local) || '{"created":[],"updated":[],"deleted":[]}');
};

const setLocalChanges = (changes: LocalChanges) => {
  localStorage.setItem(STORAGE_KEYS.local, JSON.stringify(changes));
};

// Merge logic
const mergeCategories = (): Category[] => {
  const apiData = getAPIData();
  const { created, updated, deleted } = getLocalChanges();

  const updatedMap = new Map(updated.map((cat) => [cat.id, cat]));
  const deletedSet = new Set(deleted);

  const base = apiData
    .filter((cat) => !deletedSet.has(cat.id))
    .map((cat) => updatedMap.get(cat.id) || cat);

  return [...base, ...created];
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await apiClient.get("/categories");
    setAPIData(data);
  } catch (err) {
    console.warn("API fetch failed, using cached categories", err);
  }

  return mergeCategories();
};

export const useGetCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { name: string }>({
    mutationFn: async ({ name }) => {
      const { data } = await apiClient.post("/categories", { name });
      const changes = getLocalChanges();
      changes.created.push(data);
      setLocalChanges(changes);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, Category>({
    mutationFn: async (category) => {
      const { data } = await apiClient.put(`/categories/${category.id}`, category);
      const changes = getLocalChanges();
      const idx = changes.updated.findIndex((c) => c.id === category.id);
      if (idx > -1) {
        changes.updated[idx] = data;
      } else {
        changes.updated.push(data);
      }
      setLocalChanges(changes);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/categories/${id}`);
      const changes = getLocalChanges();

      changes.deleted.push(id);
      changes.created = changes.created.filter((cat) => cat.id !== id);
      changes.updated = changes.updated.filter((cat) => cat.id !== id);

      setLocalChanges(changes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
