import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Category } from "@/lib/api";
import { useDeleteCategory } from "@/hooks/useCategories";

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categoryToDelete: Category | null;
}

export default function DeleteCategoryDialog({
  open,
  onClose,
  categoryToDelete,
}: DeleteCategoryDialogProps) {
  const deleteMutation = useDeleteCategory();

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id, {
        onSuccess: onClose,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the category {categoryToDelete?.name}?
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteMutation.isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirmDelete}
          color="error"
          variant="contained"
          disabled={deleteMutation.isLoading}
        >
          {deleteMutation.isLoading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
