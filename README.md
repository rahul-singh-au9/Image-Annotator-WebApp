# Image Annotator App

This is a Next.js application built for a technical assessment. It allows users to manage image categories, upload/view/delete images (simulated), filter them, and annotate them with rectangles using React Konva.

## Features

- Category Management (CRUD)
- Image Management (Simulated Upload, View, Delete)
- Filtering (by Name, by Category)
- Image Annotation (Draw Rectangles, Select Colors, Save/Delete Annotations)
- Responsive Design using Material UI
- Data fetching and caching with React Query
- Virtualized image gallery using React Window

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Material UI (MUI)
- React Query
- React Konva
- React Window
- Axios

## Prerequisites

- Node.js (v18.x or later recommended)
* npm or yarn

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd image-annotator-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API

This application uses a mock JSON placeholder API:
`https://my-json-server.typicode.com/MostafaKMilly/demo`

**Note:** As this is a mock API, data changes (uploads, edits, deletions) will **not** persist permanently. They will appear to work locally due to client-side state management and React Query caching but will reset on a hard refresh or when the cache expires. Image uploads are simulated by sending metadata only.

## Project Structure (Brief)