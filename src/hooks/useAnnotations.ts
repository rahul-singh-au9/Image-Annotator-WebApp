import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, Annotation } from "@/lib/api";

// --- Fetchers ---
const fetchAnnotationsByImageId = async (
  imageId: string | number
): Promise<Annotation[]> => {
  try {
    const { data } = await apiClient.get(`/images/${imageId}/annotations`);
    console.log("Fetched annotations (image endpoint):", data);
    return data;
  } catch (error) {
    console.warn("Fallback: fetching all annotations", error);
    const { data } = await apiClient.get("/annotations");
    const filtered = data.filter((ann: Annotation) => ann.imageId == imageId);
    console.log("Filtered annotations (fallback):", filtered);
    return filtered;
  }
};

const createAnnotation = async (
  newAnnotationData: Omit<Annotation, "id">
): Promise<Annotation> => {
  const { data } = await apiClient.post("/annotations", newAnnotationData);
  console.log("Created annotation:", data);
  return data;
};

const deleteAnnotation = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/annotations/${id}`);
  console.log("Deleted annotation:", id);
};

// --- Hooks ---
export const useGetAnnotationsByImageId = (
  imageId: string | number | undefined
) => {
  return useQuery<Annotation[], Error>({
    queryKey: ["annotations", imageId],
    queryFn: () => fetchAnnotationsByImageId(imageId!),
    enabled: !!imageId,
  });
};

export const useCreateAnnotation = (imageId: string | number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<Annotation, Error, Omit<Annotation, "id">>({
    mutationFn: createAnnotation,
    onSuccess: () => {
      console.log("Refetching annotations after create");
      queryClient.invalidateQueries({ queryKey: ["annotations", imageId] });
    },
    onError: (err) => {
      console.error("Annotation creation failed:", err);
    },
  });
};

export const useDeleteAnnotation = (imageId: string | number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number | string>({
    mutationFn: deleteAnnotation,
    onSuccess: () => {
      console.log("Refetching annotations after delete");
      queryClient.invalidateQueries({ queryKey: ["annotations", imageId] });
    },
    onError: (err) => {
      console.error("Annotation deletion failed:", err);
    },
  });
};
