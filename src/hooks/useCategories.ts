import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface Category {
  id: number | string;
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
      const localId = `local-${Date.now()}`; // Use timestamp as unique local id
      const newCategory = { id: localId, name };

      const changes = getLocalChanges();
      changes.created.push(newCategory);
      setLocalChanges(changes);

      return newCategory; 
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
      const changes = getLocalChanges();

      // If the category is created locally (with local id), don't hit the API
      if (typeof category.id === "string" && category.id.startsWith("local-")) {
        const idx = changes.created.findIndex((c) => c.id === category.id);
        if (idx > -1) {
          changes.created[idx] = category;
        } else {
          changes.created.push(category);
        }
        setLocalChanges(changes);
        return category; // Return immediately for UI update
      }

      // Otherwise, update via API
      const { data } = await apiClient.put(`/categories/${category.id}`, category);
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

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      const changes = getLocalChanges();

      const isLocal = typeof id === "string" && id.startsWith("local-");

      if (isLocal) {
        // Remove local-only category
        changes.created = changes.created.filter((cat) => cat.id !== id);
        changes.updated = changes.updated.filter((cat) => cat.id !== id);
        setLocalChanges(changes);
        return;
      }

      // Otherwise, delete via API
      await apiClient.delete(`/categories/${id}`);
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
