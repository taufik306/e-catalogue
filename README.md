# Modern E-Catalogue Application

A mobile-first, Progressive Web App (PWA) e-catalogue built with React, Vite, and Tailwind CSS. This application is designed to display products one at a time using smooth horizontal swiping, and it fetches its data directly from a published Google Spreadsheet, eliminating the need for a traditional backend database.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
* `npm` (usually comes with Node.js)

## Getting Started

1. **Clone the repository and navigate to the project directory**
2. **Install Dependencies**
   ```bash
   npm install
   ```

## Configuring Data (Google Sheets)

The application fetches item data (Name, Price, ImageURL) from a Google Sheet published as a CSV.

### Setting up the Sheet:
1. Create a new [Google Sheet](https://sheets.google.com).
2. Set up three column headers in the first row: `Name`, `Price`, and `ImageURL`.
3. Add your items into the rows below. Make sure the image URLs point to publicly accessible images (e.g., `https://example.com/image.jpg`).
4. In Google Sheets, click **File > Share > Publish to web**.
5. Change the format dropdown from "Web page" to **Comma-separated values (.csv)**.
6. Click "Publish" and copy the generated link.

### Linking the Sheet to the App:
Create a `.env` file in the root directory of this project and add the copied link like so:

```env
VITE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
```

*Note: If no URL is provided, the application will automatically fall back to a set of placeholder dummy data so you can test the UI immediately.*

## Running the App

### Development Mode
To start the local development server with Hot Module Replacement:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser. For the best experience, open Developer Tools and toggle the Device Toolbar to view it in mobile mode.

### Production Build
To build the app for production (including generating the PWA Service Worker):
```bash
npm run build
```

To preview the built production site locally:
```bash
npm run preview
```

## Features
* **Modern Stack:** React 19, Vite, Tailwind CSS v3.
* **Responsive & Mobile First:** Full-screen snap-scrolling architecture.
* **Progressive Web App (PWA):** Offline support and caching configured via `vite-plugin-pwa`.
* **Zero Backend:** Uses `papaparse` to read data directly from Google Sheets.
