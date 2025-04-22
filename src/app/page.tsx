"use client";

import React from "react";
import ImageGallery from "@/components/images/ImageGallery";
import { Box, Button, Typography } from "@mui/material";
import ImageUploadDialog from "@/components/images/ImageUploadDialog";

export default function HomePage() {
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

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
        <Typography variant="h5">Image Gallery</Typography>
        <Button variant="contained" onClick={() => setIsUploadOpen(true)}>
          Upload Image
        </Button>
      </Box>
      <ImageGallery />
      <ImageUploadDialog
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </Box>
  );
}
