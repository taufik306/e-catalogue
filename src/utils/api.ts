import Papa from 'papaparse';
import type { CatalogueItem } from '../types';

// Example Google Sheet published as CSV link (Placeholder)
// You can replace this with your actual Google Sheet CSV publish link
const DEFAULT_SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL || '';

const fallbackData: CatalogueItem[] = [
  {
    id: '1',
    name: 'Modern Accent Chair',
    price: '$299.00',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Minimalist Wood Table',
    price: '$450.00',
    imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Ceramic Table Lamp',
    price: '$85.00',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Linen Throw Pillow',
    price: '$45.00',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export async function fetchCatalogueData(): Promise<CatalogueItem[]> {
  if (!DEFAULT_SHEET_CSV_URL) {
    console.warn('No Google Sheet CSV URL provided. Using fallback dummy data.');
    return new Promise(resolve => setTimeout(() => resolve(fallbackData), 800)); // Simulate network delay
  }

  try {
    const response = await fetch(DEFAULT_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const items: CatalogueItem[] = (results.data as Record<string, string>[]).map((row, index) => ({
            id: String(index + 1),
            name: row['Name'] || row['name'] || 'Unknown Item',
            price: row['Price'] || row['price'] || '-',
            imageUrl: row['ImageURL'] || row['ImageUrl'] || row['imageurl'] || '',
          }));
          resolve(items);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    // If fetching fails (e.g. offline and not cached), fallback to dummy data or empty
    return fallbackData;
  }
}
