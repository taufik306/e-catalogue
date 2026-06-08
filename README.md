# Modern E-Catalogue Application

A mobile-first, Progressive Web App (PWA) e-catalogue built with React, Vite, and Tailwind CSS. This application is designed to display products one at a time using smooth horizontal swiping, and it fetches its data directly from a published Google Spreadsheet, eliminating the need for a traditional backend database.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (minimum: 20.19.0; 22.12.0 or newer recommended)
* `npm` (usually comes with Node.js)

## Getting Started

1. **Clone the repository and navigate to the project directory (e.g., git clone <repository-url> && cd <repository-name>)**
2. **Install Dependencies**
   ```bash
   npm install
   ```

## Configuring Data (Google Sheets)

The application fetches hierarchical catalogue data from a Google Sheet published as a CSV.

### Setting up the Sheet:
1. Create a new [Google Sheet](https://sheets.google.com).
2. Set up these column headers in the first row: `ID`, `ParentID`, `Name`, `Price`, `ImageURL`, `SortOrder`, and `Active`.
3. Add your items into the rows below. Make sure each `ID` is unique and stable, and make sure the image URLs point to publicly accessible images (e.g., `https://example.com/image.jpg`).
4. In Google Sheets, click **File > Share > Publish to web**.
5. Change the format dropdown from "Web page" to **Comma-separated values (.csv)**.
6. Click "Publish" and copy the generated link.

Example CSV:

```csv
ID,ParentID,Name,Price,ImageURL,SortOrder,Active
chair,,Modern Accent Chair,$299,https://example.com/chair.jpg,1,TRUE
chair-fabric,chair,Fabric Accent Chair,$299,https://example.com/chair-fabric.jpg,1,TRUE
chair-fabric-blue,chair-fabric,Blue Fabric Accent Chair,$319,https://example.com/chair-blue.jpg,1,TRUE
table,,Minimalist Wood Table,$450,https://example.com/table.jpg,2,TRUE
```

Rows with an empty `ParentID` are top-level catalogue items. Rows with `ParentID` become children of the row whose `ID` matches, so the catalogue can have as many nested levels as needed. If `Active` is `FALSE`, that item and all of its children are hidden. Empty `Active` values default to visible.

A complete sample CSV is available at `docs/sample-catalogue.csv`.

### Linking the Sheet to the App:
Create a `.env` file in the root directory of this project and add the copied link like so:

```env
VITE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
```

*Note: If no URL is provided, the application will automatically fall back to a set of placeholder dummy data so you can test the UI immediately.*

### Using the Sheet URL on GitHub Pages

Vite reads `VITE_SHEET_CSV_URL` at build time, so GitHub Actions also needs this value when it runs `npm run build`.

For GitHub Pages deployment, add a repository variable:

1. Open your GitHub repository.
2. Go to **Settings > Secrets and variables > Actions > Variables**.
3. Create a new repository variable named `VITE_SHEET_CSV_URL`.
4. Set its value to your published Google Sheet CSV URL.

The deploy workflow passes that repository variable into the production build automatically.

Because this is a frontend app, `VITE_SHEET_CSV_URL` is included in the built JavaScript and can be seen by browser users. Use a published CSV URL that is safe to expose publicly.

## Running the App

### Development Mode
To start the local development server with Hot Module Replacement:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser. For the best experience, open Developer Tools and toggle the Device Toolbar to view it in mobile mode.

To test from a mobile phone on the same Wi-Fi network:

```bash
npm run dev:host
```

Open the Network URL displayed in your terminal on your mobile phone (for example, http://192.168.1.100:5173/).

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
