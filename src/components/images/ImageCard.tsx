import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import { Image } from "@/lib/api";

interface ImageCardProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    images: Image[];
    numColumns: number;
    onDeleteClick: (image: Image) => void;
  };
}

export default function ImageCard({
  columnIndex,
  rowIndex,
  style,
  data,
}: ImageCardProps) {
  const { images, numColumns, onDeleteClick } = data;
  const index = rowIndex * numColumns + columnIndex;

  if (index >= images.length) {
    return null;
  }

  const image = images[index];
  console.log({ image, images }, "<==");
  return (
    <Box style={style} sx={{ p: 1, m: 1 }}>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardMedia
          component="img"
          image={
            image.url ||
            `https://via.placeholder.com/300x200?text=${encodeURIComponent(
              image.name
            )}`
          }
          alt={image.name}
          sx={{ aspectRatio: "3/2" }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {image.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Category: {image.category?.name || "N/A"}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", pt: 0 }}>
          <Button size="small" component={Link} href={`/images/${image.id}`}>
            View/Annotate
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(image)}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
