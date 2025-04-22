import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Image } from "@/lib/api";
import { useDeleteImage } from "@/hooks/useImages";

interface DeleteImageDialogProps {
  open: boolean;
  onClose: () => void;
  imageToDelete: Image | null;
}

export default function DeleteImageDialog({
  open,
  onClose,
  imageToDelete,
}: DeleteImageDialogProps) {
  const deleteMutation = useDeleteImage();

  const handleConfirmDelete = () => {
    if (imageToDelete) {
      deleteMutation.mutate(imageToDelete.id, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-image-dialog-title"
    >
      <DialogTitle id="delete-image-dialog-title">
        Confirm Image Deletion
      </DialogTitle>
      <DialogContent>
        {deleteMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to delete image:{" "}
            {(deleteMutation.error as Error)?.message || "Unknown error"}
          </Alert>
        )}
        <DialogContentText>
          Are you sure you want to delete the image {`${imageToDelete?.name}`}?
          Associated annotations might also be affected (depending on backend
          logic - though not with this mock API). This action cannot be undone.
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
          {deleteMutation.isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
