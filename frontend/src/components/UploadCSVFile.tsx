import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNotifications } from "@toolpad/core";
import Papa from "papaparse";

import FileUploadButton from "@/components/FileUploadButton";

function parseRow(
  row: Record<string, string>,
  validHeaders: readonly string[],
): Record<string, string> | null {
  const relevantEntries = validHeaders.map((header) => {
    const value = row[header]?.trim() || null;
    return [header, value];
  });

  if (relevantEntries.some((entry) => entry[1] === null)) {
    return null;
  }

  return Object.fromEntries(relevantEntries);
}

export default function UploadCSVFile<Headers extends readonly string[]>({
  label,
  allowedHeaders,
  onUpload,
}: {
  label: string;
  allowedHeaders: Headers;
  onUpload: (data: Record<Headers[number], string>[]) => void;
}) {
  const notifications = useNotifications();

  function parseRows(rows: Record<string, string>[]) {
    if (rows.length === 0) {
      notifications.show("Opplasting feilet! Filen har ingen data", {
        severity: "error",
        autoHideDuration: 5000,
      });
      return null;
    }

    const parsedRows: Record<string, string>[] = [];
    for (let rowNumber = 0; rowNumber < rows.length; rowNumber++) {
      const parsedRow = parseRow(rows[rowNumber] ?? {}, allowedHeaders);
      if (parsedRow === null) {
        notifications.show(
          `Opplasting feilet! Rad nummer ${rowNumber + 2} mangler data. Krever: [${allowedHeaders.join(", ")}]`,
          {
            severity: "error",
            autoHideDuration: 5000,
          },
        );
        return null;
      }
      parsedRows.push(parsedRow);
    }

    return parsedRows;
  }

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const csvText = reader.result as string;

      Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data, errors }) => {
          if (errors.length) {
            notifications.show("Klarte ikke lese CSV: " + errors, {
              severity: "error",
              autoHideDuration: 3000,
            });
            return;
          }
          const parsedRows = parseRows(data);
          if (parsedRows !== null) {
            onUpload(parsedRows);
          }
        },
        error: (error: unknown) => {
          notifications.show("Klarte ikke lese CSV: " + error, {
            severity: "error",
            autoHideDuration: 3000,
          });
        },
      });
    };

    reader.onerror = (err) => {
      console.error("File read error:", err);
    };

    if (file) reader.readAsText(file);
  }

  return (
    <FileUploadButton
      onUpload={handleUpload}
      accept=".csv,text/csv"
      multiple={false}
      startIcon={<CloudUploadIcon />}
      label={label}
    />
  );
}
