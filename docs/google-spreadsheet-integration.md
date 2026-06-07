# Google Spreadsheet Integration Entry Point

This app reads catalogue data from a published Google Sheet by fetching the sheet as a CSV file. It does not use the Google Sheets API directly.

## Main Entry Point

The main integration entry point is:

```text
src/utils/api.ts
```

Inside that file, the key function is:

```ts
export async function fetchCatalogueData(): Promise<CatalogueItem[]>
```

This function is responsible for:

- Reading the Google Sheet CSV URL from the Vite environment variable.
- Fetching the published CSV file.
- Parsing the CSV response with `papaparse`.
- Mapping each spreadsheet row into a `CatalogueItem`.
- Returning fallback dummy data when no sheet URL is configured or when the fetch fails.

## App Call Flow

The app loads spreadsheet data through this flow:

```text
src/main.tsx
  -> renders src/App.tsx
    -> App useEffect runs on initial load
      -> calls fetchCatalogueData()
        -> src/utils/api.ts fetches and parses the Google Sheet CSV
```

The app-level call happens in `src/App.tsx`:

```ts
const data = await fetchCatalogueData();
setItems(data);
```

This means `App` does not know about Google Sheets directly. It only asks `fetchCatalogueData()` for catalogue items.

## Google Sheet URL Configuration

The Google Sheet CSV URL is configured through:

```text
VITE_SHEET_CSV_URL
```

That value is read in `src/utils/api.ts`:

```ts
const DEFAULT_SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL || '';
```

The URL should be a published Google Sheet CSV link, for example:

```text
https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
```

## Data Fetching

The actual spreadsheet fetch happens in `src/utils/api.ts`:

```ts
const response = await fetch(DEFAULT_SHEET_CSV_URL);
```

After the response is received, the CSV text is parsed with `Papa.parse`.

## Expected Spreadsheet Columns

The parser expects these spreadsheet columns:

```text
Name
Price
ImageURL
```

The code also accepts some lowercase or slightly different variants:

- `name`
- `price`
- `ImageUrl`
- `imageurl`

Each row is converted into this application shape:

```ts
{
  id: String(index + 1),
  name: row['Name'] || row['name'] || 'Unknown Item',
  price: row['Price'] || row['price'] || '-',
  imageUrl: row['ImageURL'] || row['ImageUrl'] || row['imageurl'] || '',
}
```

## Offline and Fallback Behavior

If `VITE_SHEET_CSV_URL` is empty, the app does not attempt to fetch Google Sheets. Instead, it returns local fallback catalogue data from `src/utils/api.ts`.

If the fetch fails, the app logs the error and also returns the same fallback data.

## PWA Cache

Google Sheets responses are cached by the PWA configuration in:

```text
vite.config.ts
```

The relevant cache rule matches:

```ts
urlPattern: /^https:\/\/docs\.google\.com\/spreadsheets\/.*/i
```

That cache uses a `NetworkFirst` strategy, so the app tries the network first and can fall back to cached spreadsheet data when available.

## Summary

To understand or modify the Google Spreadsheet integration, start with `src/utils/api.ts`.

To see where the app first requests spreadsheet-backed catalogue data, check `src/App.tsx`.
