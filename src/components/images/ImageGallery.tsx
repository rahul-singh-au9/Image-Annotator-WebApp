"use client";
import React, { useState, useMemo } from "react";
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useGetImages } from "@/hooks/useImages";
import ImageCard from "./ImageCard";
import { Image } from "@/lib/api";
import DeleteImageDialog from "./DeleteImageDialog";
import ImageFilters from "./ImageFilters";

const COLUMN_WIDTH = 320;
const ROW_HEIGHT = 390;

export default function ImageGallery() {
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null);
  const [filters, setFilters] = useState({ searchTerm: "", categoryId: "" });
  const { data: images = [], isLoading, error } = useGetImages();
  // Client-side Filtering
  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      const nameMatch = filters.searchTerm
        ? image.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        : true;
      const categoryMatch = filters.categoryId
        ? image.categoryId === filters.categoryId ||
          image.categoryId.toString() === filters.categoryId
        : true;
      return nameMatch && categoryMatch;
    });
  }, [images, filters]);

  const handleDeleteClick = (image: Image) => {
    setImageToDelete(image);
  };

  const handleCloseDeleteDialog = () => {
    setImageToDelete(null);
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error">Error loading images: {error.message}</Alert>
    );

  return (
    <Box sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
      {" "}
      <ImageFilters currentFilters={filters} onFilterChange={setFilters} />
      {filteredImages.length === 0 && !isLoading && (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          No images found matching your criteria.
        </Typography>
      )}
      {filteredImages.length > 0 && (
        <AutoSizer>
          {({ height, width }) => {
            const numColumns = Math.max(1, Math.floor(width / COLUMN_WIDTH));
            const numRows = Math.ceil(filteredImages.length / numColumns);

            return (
              <FixedSizeGrid
                columnCount={numColumns}
                columnWidth={Math.floor(width / numColumns)}
                rowCount={numRows}
                rowHeight={ROW_HEIGHT}
                width={width}
                height={height}
                itemData={{
                  images: filteredImages,
                  numColumns: numColumns,
                  onDeleteClick: handleDeleteClick,
                }}
              >
                {ImageCard}
              </FixedSizeGrid>
            );
          }}
        </AutoSizer>
      )}
      <DeleteImageDialog
        open={!!imageToDelete}
        onClose={handleCloseDeleteDialog}
        imageToDelete={imageToDelete}
      />
    </Box>
  );
}
