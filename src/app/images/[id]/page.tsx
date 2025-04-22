"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useGetImageById } from "@/hooks/useImages";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
} from "@mui/material";
import Link from "next/link";
import AnnotationCanvas from "@/components/annotations/AnnotationCanvas";

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ImageDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: image, isLoading, error } = useGetImageById(id);
  console.log({ image, isLoading, error }, "<==");

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error">
        Error loading image details: {error.message}
      </Alert>
    );

  if (!image) return <Alert severity="warning">Image not found.</Alert>;

  const imageUrl =
    image.url ||
    `https://via.placeholder.com/600x400?text=${encodeURIComponent(
      image.name
    )}`;

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} underline="hover" color="inherit" href="/">
          Gallery
        </MuiLink>
        <Typography color="text.primary">{image.name}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {image.name}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          Category:{" "}
          <Typography component="span" color="text.secondary">
            {image.category?.name || "Loading..."}
          </Typography>
        </Typography>
        <Typography variant="body2">
          Uploaded:{" "}
          <Typography component="span" color="text.secondary">
            {formatDate(image.uploadDate)}
          </Typography>
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Annotation Section */}
      <AnnotationCanvas imageId={image.id} imageUrl={imageUrl} />
    </Box>
  );
}
