import React, { useState } from 'react';
import Papa from 'papaparse';

export interface Transaction {
  Date: string;
  Description: string;
  Amount: number;
  category?: string;
  id: string;
}

interface CSVUploadProps {
  onTransactionsUploaded: (transactions: Transaction[]) => void;
}

export default function CSVUpload({ onTransactionsUploaded }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const transactions: Transaction[] = results.data
            .filter((row: any) => row.Date && row.Description && row.Amount)
            .map((row: any, index: number) => ({
              id: `${Date.now()}-${index}`,
              Date: row.Date,
              Description: row.Description,
              Amount: parseFloat(row.Amount),
              category: 'Uncategorized'
            }));

          onTransactionsUploaded(transactions);
          setIsUploading(false);
        } catch (err) {
          setError('Error parsing CSV file. Please check the format.');
          setIsUploading(false);
        }
      },
      error: (err) => {
        setError(`Error reading file: ${err.message}`);
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Bank Statements</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV File (Date, Description, Amount columns required)
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {isUploading && (
        <div className="flex items-center text-blue-600">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing CSV file...
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Expected CSV format:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Date: YYYY-MM-DD or MM/DD/YYYY</li>
          <li>Description: Transaction description</li>
          <li>Amount: Positive/negative number</li>
        </ul>
      </div>
    </div>
  );
}