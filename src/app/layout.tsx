import * as React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import Link from "next/link";
import Button from "@mui/material/Button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Annotator",
  description: "Manage and annotate images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          <AppBar position="fixed">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link
                  href="/"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Image Annotator
                </Link>
              </Typography>
              <Button component={Link} href="/categories" color="inherit">
                Categories
              </Button>
              {/* Add Upload Button later */}
            </Toolbar>
          </AppBar>
          <Toolbar /> {/* Offset for fixed AppBar */}
          <ReactQueryProvider>
            <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
              {children}
            </Container>
          </ReactQueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
