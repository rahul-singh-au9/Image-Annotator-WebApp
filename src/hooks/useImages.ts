import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { apiClient, Image, Category } from "@/lib/api";

const STORAGE_KEYS = {
  api: "images_api",
  local: "images_local",
};

interface LocalImageChanges {
  created: Image[];
  updated: Image[];
  deleted: (string | number)[];
}

// --- Query Keys ---
const imagesQueryKey: QueryKey = ["images"];
const imageQueryKey = (id: string | number | undefined): QueryKey => [
  "image",
  id,
];

// --- Local Storage ---
const getAPIData = (): Image[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.api) || "[]");
};

const setAPIData = (data: Image[]) => {
  localStorage.setItem(STORAGE_KEYS.api, JSON.stringify(data));
};

const getLocalChanges = (): LocalImageChanges => {
  if (typeof window === "undefined")
    return { created: [], updated: [], deleted: [] };
  return JSON.parse(
    localStorage.getItem(STORAGE_KEYS.local) ||
      '{"created":[],"updated":[],"deleted":[]}'
  );
};

const setLocalChanges = (changes: LocalImageChanges) => {
  localStorage.setItem(STORAGE_KEYS.local, JSON.stringify(changes));
};

// --- Merge Function ---
const mergeImages = (apiImages: Image[]): Image[] => {
  const { created, updated, deleted } = getLocalChanges();

  const updatedMap = new Map(updated.map((img) => [img.id, img]));
  const deletedSet = new Set(deleted);

  const base = apiImages
    .filter((img) => !deletedSet.has(img.id))
    .map((img) => updatedMap.get(img.id) || img);

  return [...base, ...created];
};

// --- Fetch Function ---
const fetchImages = async (): Promise<Image[]> => {
  try {
    const [imagesRes, categoriesRes] = await Promise.all([
      apiClient.get("/images"),
      apiClient.get("/categories"),
    ]);
    const images: Image[] = imagesRes.data;
    const categories: Category[] = categoriesRes.data;
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    const enriched = images.map((img) => ({
      ...img,
      category: categoryMap.get(img.categoryId),
    }));

    setAPIData(enriched); // Save to localStorage
  } catch (err) {
    console.warn("API fetch failed, using cache", err);
  }

  const raw = getAPIData();
  return mergeImages(raw);
};

export const useGetImages = () => {
  return useQuery<Image[], Error>({
    queryKey: imagesQueryKey,
    queryFn: fetchImages,
    staleTime: 1000 * 30,
  });
};

// --- Fetch Image by ID ---
const fetchImageById = async (id: string | number): Promise<Image> => {
  const { data } = await apiClient.get(`/images/${id}`);
  try {
    if (data.categoryId) {
      const res = await apiClient.get(`/categories/${data.categoryId}`);
      data.category = res.data;
    }
  } catch {}
  return data;
};

export const useGetImageById = (id: string | number | undefined) => {
  return useQuery<Image, Error>({
    queryKey: imageQueryKey(id),
    queryFn: () => fetchImageById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// --- Create ---
interface CreateImageData {
  name: string;
  categoryId: number | string;
  url: string;
}

export const useCreateImage = () => {
  const queryClient = useQueryClient();

  return useMutation<Image, Error, CreateImageData>({
    mutationFn: async (data) => {
      const image = {
        ...data,
        // url: `https://via.placeholder.com/300x200/EEE/888?text=${encodeURIComponent(
        //   data.name
        // )}`,
        url: data.url,
        uploadDate: new Date().toISOString(),
        metadata: {
          size: Math.floor(Math.random() * 5000) + 1000,
          resolution: "1024x768",
        },
      };
      const res = await apiClient.post("/images", image);
      try {
        if (res.data.categoryId) {
          const catRes = await apiClient.get(
            `/categories/${res.data.categoryId}`
          );
          res.data.category = catRes.data;
        }
      } catch {}
      const changes = getLocalChanges();
      changes.created.push(res.data);
      setLocalChanges(changes);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKey });
    },
  });
};

// --- Delete ---
export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      const changes = getLocalChanges();

      const isLocal = changes.created.some(img => img.id === id);

      if (isLocal) {
        changes.created = changes.created.filter(img => img.id !== id);
      } else {
        await apiClient.delete(`/images/${id}`);
        changes.deleted.push(id);
        changes.updated = changes.updated.filter(img => img.id !== id);
      }

      setLocalChanges(changes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKey });
    },
  });
};


export const useUpdateImage = () => {
  const queryClient = useQueryClient();
  return useMutation<Image, Error, Image>({
    mutationFn: async (image) => {
      const { data } = await apiClient.put(`/images/${image.id}`, image);
      try {
        if (data.categoryId) {
          const res = await apiClient.get(`/categories/${data.categoryId}`);
          data.category = res.data;
        }
      } catch {}
      const changes = getLocalChanges();
      const idx = changes.updated.findIndex((img) => img.id === image.id);
      if (idx > -1) changes.updated[idx] = data;
      else changes.updated.push(data);
      setLocalChanges(changes);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKey });
    },
  });
};
