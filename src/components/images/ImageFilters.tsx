import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import { useGetCategories } from "@/hooks/useCategories";

interface ImageFiltersProps {
  currentFilters: { searchTerm: string; categoryId: string | number };
  onFilterChange: (filters: {
    searchTerm: string;
    categoryId: string | number;
  }) => void;
}

export default function ImageFilters({
  currentFilters,
  onFilterChange,
}: ImageFiltersProps) {
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategories();
  const [searchTerm, setSearchTerm] = useState(currentFilters.searchTerm);
  const [categoryId, setCategoryId] = useState(currentFilters.categoryId);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ searchTerm, categoryId });
    }, 500); // Debounce requests
    return () => clearTimeout(handler);
  }, [searchTerm, categoryId, onFilterChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string | number>) => {
    setCategoryId(event.target.value);
    // Update immediately on category change
    // onFilterChange({ searchTerm, categoryId: event.target.value });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <TextField
        label="Search by Name"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        size="small"
        sx={{ flexGrow: 1, minWidth: "200px" }}
      />
      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel id="category-filter-label">Filter by Category</InputLabel>
        <Select
          labelId="category-filter-label"
          id="category-filter"
          value={categoryId}
          label="Filter by Category"
          onChange={handleCategoryChange}
          disabled={isLoadingCategories}
          startAdornment={
            isLoadingCategories ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : null
          }
        >
          <MenuItem value="">
            <em>All Categories</em>
          </MenuItem>
          {categories?.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
