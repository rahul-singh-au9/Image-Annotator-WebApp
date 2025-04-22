"use client";
import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useGetCategories } from "@/hooks/useCategories";
import { Category } from "@/lib/api";
import CategoryForm from "./CategoryForm";
import DeleteCategoryDialog from "./DeleteCategoryDialog";

export default function CategoryList() {
  const { data: categories, isLoading, error } = useGetCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const handleOpenForm = (category: Category | null = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  if (isLoading) return <CircularProgress />;
  if (error)
    return (
      <Alert severity="error">Error loading categories: {error.message}</Alert>
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Manage Categories</Typography>
        <Button variant="contained" onClick={() => handleOpenForm()}>
          Create New Category
        </Button>
      </Box>

      <List>
        {categories?.length === 0 && (
          <ListItem>
            <ListItemText primary="No categories found." />
          </ListItem>
        )}
        {categories?.map((category) => (
          <ListItem
            key={category.id}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleOpenForm(category)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  sx={{ ml: 1 }}
                  onClick={() => handleOpenDeleteDialog(category)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>

      {/* Render Modals */}
      <CategoryForm
        open={isFormOpen}
        onClose={handleCloseForm}
        categoryToEdit={selectedCategory}
      />
      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        categoryToDelete={selectedCategory}
      />
    </Box>
  );
}
