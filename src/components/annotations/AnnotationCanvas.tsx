"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Transformer,
} from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  Paper,
  Typography,
} from "@mui/material";
import {
  useGetAnnotationsByImageId,
  useCreateAnnotation,
  useDeleteAnnotation,
} from "@/hooks/useAnnotations";
import { Annotation } from "@/lib/api";

interface AnnotationCanvasProps {
  imageUrl: string;
  imageId: string | number;
}

interface DrawingRect {
  x: number;
  y: number;
  width: number;
  height: number;
  isDrawing: boolean;
}

const ANNOTATION_COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
]; // Red, Green, Blue, Yellow, Magenta

export default function AnnotationCanvas({
  imageUrl,
  imageId,
}: AnnotationCanvasProps) {
  const [img, status] = useImage(imageUrl);
  const {
    data: annotations = [],
    isLoading: isLoadingAnnotations,
    error: errorAnnotations,
  } = useGetAnnotationsByImageId(imageId);
  const createMutation = useCreateAnnotation(imageId);
  const deleteMutation = useDeleteAnnotation(imageId);

  const [drawingRect, setDrawingRect] = useState<DrawingRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    isDrawing: false,
  });
  const [stageSize, setStageSize] = useState({ width: 500, height: 400 });
  const [selectedColor, setSelectedColor] = useState<string>(
    ANNOTATION_COLORS[0]
  );
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | number | null
  >(null);

  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Adapt Stage Size ---
  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Calculate height based on image aspect ratio if available
        const height = img ? (width / img.width) * img.height : width * (3 / 4);
        setStageSize({ width, height: Math.max(200, height) });
      }
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [img]); // Rerun when image loads

  // --- Transformer Logic ---
  useEffect(() => {
    if (selectedAnnotationId && transformerRef.current && layerRef.current) {
      const node = layerRef.current.findOne("#" + selectedAnnotationId); // Find shape by ID
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [selectedAnnotationId]);

  // --- Mouse Events for Drawing ---
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking stage (not on existing annotation)
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.hasName("image-background");
    if (clickedOnEmpty) {
      setSelectedAnnotationId(null);
    }

    // Only start drawing if clicking on the image background directly
    if (e.target.hasName("image-background")) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setDrawingRect({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          isDrawing: true,
        });
        setSelectedAnnotationId(null); // Deselect any annotation when starting draw
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawingRect.isDrawing) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      setDrawingRect((prev) => ({
        ...prev,
        width: pos.x - prev.x,
        height: pos.y - prev.y,
      }));
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawingRect.isDrawing) return;
    setDrawingRect((prev) => ({ ...prev, isDrawing: false }));

    const newAnnotation = {
      x: Math.min(drawingRect.x, drawingRect.x + drawingRect.width), // Handle negative drag
      y: Math.min(drawingRect.y, drawingRect.y + drawingRect.height),
      width: Math.abs(drawingRect.width),
      height: Math.abs(drawingRect.height),
      color: selectedColor,
      imageId: imageId,
    };

    // Basic validation: ignore tiny boxes
    if (newAnnotation.width > 5 && newAnnotation.height > 5) {
      createMutation.mutate(newAnnotation, {
        onError: (err) =>
          alert(`Failed to save annotation: ${(err as Error).message}`),
      });
    }
  };

  // --- Annotation Deletion ---
  const handleDeleteSelected = () => {
    if (selectedAnnotationId && !deleteMutation.isLoading) {
      deleteMutation.mutate(selectedAnnotationId, {
        onSuccess: () => setSelectedAnnotationId(null), // Deselect on success
        onError: (err) =>
          alert(`Failed to delete annotation: ${(err as Error).message}`),
      });
    }
  };

  // --- Loading/Error States ---
  if (status === "loading")
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  if (status === "failed")
    return <Alert severity="error">Failed to load image.</Alert>;
  if (isLoadingAnnotations)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  if (errorAnnotations)
    return (
      <Alert severity="error">
        Error loading annotations: {errorAnnotations.message}
      </Alert>
    );

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Annotate Image
      </Typography>
      {/* Color Selection */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          Color:
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          {ANNOTATION_COLORS.map((color) => (
            <Button
              key={color}
              onClick={() => setSelectedColor(color)}
              sx={{
                backgroundColor: color,
                minWidth: "30px",
                height: "30px",
                border:
                  selectedColor === color
                    ? "3px solid black"
                    : `1px solid grey`,
                "&:hover": {
                  backgroundColor: color,
                  opacity: 0.8,
                },
              }}
            />
          ))}
        </ButtonGroup>
        {selectedAnnotationId && (
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={handleDeleteSelected}
            disabled={deleteMutation.isLoading}
            startIcon={
              deleteMutation.isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
            sx={{ ml: "auto" }}
          >
            Delete Selected
          </Button>
        )}
      </Box>

      {/* Konva Stage */}
      <Box
        ref={containerRef}
        sx={{
          border: "1px solid lightgrey",
          position: "relative",
          cursor: "crosshair",
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {/* Background Image */}
            <KonvaImage
              image={img}
              width={stageSize.width}
              height={stageSize.height}
              name="image-background" // Name for event targeting
            />
            {/* Saved Annotations */}
            {annotations.map((ann) => (
              <Rect
                key={ann.id}
                id={ann.id.toString()}
                x={ann.x}
                y={ann.y}
                width={ann.width}
                height={ann.height}
                stroke={ann.color}
                strokeWidth={selectedAnnotationId === ann.id ? 3 : 2}
                draggable // Optional: Allow dragging existing annotations
                onClick={() => setSelectedAnnotationId(ann.id)}
                onTap={() => setSelectedAnnotationId(ann.id)} // For touch devices
                // Add onDragEnd to update position via API if draggable
              />
            ))}
            {/* Currently Drawing Rectangle */}
            {drawingRect.isDrawing && (
              <Rect
                x={drawingRect.x}
                y={drawingRect.y}
                width={drawingRect.width}
                height={drawingRect.height}
                stroke={selectedColor}
                strokeWidth={2}
                dash={[5, 5]} // Dashed line while drawing
              />
            )}
            {/* Transformer for Selected Annotation */}
            <Transformer
              ref={transformerRef}
              borderStroke="black"
              borderDash={[6, 2]}
            />
          </Layer>
        </Stage>
        {(createMutation.isLoading || deleteMutation.isLoading) && (
          <CircularProgress
            sx={{ position: "absolute", top: 10, right: 10 }}
            size={20}
          />
        )}
      </Box>
    </Paper>
  );
}
