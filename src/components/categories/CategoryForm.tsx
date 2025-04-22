import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { Category } from "@/lib/api";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export default function CategoryForm({
  open,
  onClose,
  categoryToEdit,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const mutation = categoryToEdit ? updateMutation : createMutation;

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
    } else {
      setName("");
    }
  }, [categoryToEdit, open]); // Reset when dialog opens or category changes

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    if (categoryToEdit) {
      updateMutation.mutate(
        { ...categoryToEdit, name },
        { onSuccess: handleClose }
      );
    } else {
      createMutation.mutate({ name }, { onSuccess: handleClose });
    }
  };

  const handleClose = () => {
    setName(""); // Reset form
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {categoryToEdit ? "Edit Category" : "Create New Category"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={mutation.isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={mutation.isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? (
              <CircularProgress size={24} />
            ) : categoryToEdit ? (
              "Save Changes"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
