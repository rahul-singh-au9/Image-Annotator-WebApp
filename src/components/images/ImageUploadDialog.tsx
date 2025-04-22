"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { useGetCategories } from "@/hooks/useCategories";
import { useCreateImage } from "@/hooks/useImages";
import Image from "next/image";

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ImageUploadDialog({
  open,
  onClose,
}: ImageUploadDialogProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | number>("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetCategories();
  const createImageMutation = useCreateImage();

  const handleCategoryChange = (event: SelectChangeEvent<string | number>) => {
    setCategoryId(event.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const preview = URL.createObjectURL(selectedFile);
      setPreviewUrl(preview);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !categoryId) return;

    createImageMutation.mutate(
      {
        name,
        categoryId,
        url: previewUrl || "",
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setName("");
    setCategoryId("");
    setFile(null);
    setPreviewUrl(null);
    createImageMutation.reset(); // Reset mutation state
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload New Image (Simulation)</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {createImageMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to upload image:{" "}
              {(createImageMutation.error as Error)?.message || "Unknown error"}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="image-name"
            label="Image Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={createImageMutation.isLoading}
          />
          <FormControl
            fullWidth
            margin="dense"
            required
            disabled={isLoadingCategories || createImageMutation.isLoading}
          >
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={categoryId}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="" disabled>
                <em>Select a category</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {isLoadingCategories && (
              <CircularProgress
                size={20}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  marginTop: "-10px",
                }}
              />
            )}
          </FormControl>

          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Select Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Preview"
              width={300}
              height={200}
              style={{
                marginTop: 16,
                objectFit: "contain",
                maxHeight: 200,
                borderRadius: 8,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={createImageMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              !name.trim() || !categoryId || createImageMutation.isLoading
            }
          >
            {createImageMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Upload"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
