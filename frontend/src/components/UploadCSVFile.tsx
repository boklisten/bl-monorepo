import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNotifications } from "@toolpad/core";
import Papa from "papaparse";

import FileUploadButton from "@/components/FileUploadButton";
import { ERROR_NOTIFICATION } from "@/utils/notifications";

type ParsedRow<Headers extends string[]> = Record<
  Headers[number],
  string | string[]
>;

export default function UploadCSVFile<Headers extends string[]>({
  label,
  allowedHeaders,
  onUpload,
  loading = false,
}: {
  label: string;
  allowedHeaders: Headers;
  onUpload: (data: ParsedRow<Headers>[]) => void;
  loading?: boolean;
}) {
  const notifications = useNotifications();

  function parseRows(rows: string[][]): ParsedRow<string[]>[] | null {
    if (rows.length < 2) {
      notifications.show(
        "Opplasting feilet! Filen har ingen data",
        ERROR_NOTIFICATION,
      );
      return null;
    }

    const headerRow = rows[0]?.map((h) => h.trim()) ?? [];
    const headerIndexMap: Record<string, number[]> = {};
    headerRow.forEach((headerName, i) => {
      if (allowedHeaders.includes(headerName)) {
        if (!headerIndexMap[headerName]) {
          headerIndexMap[headerName] = [];
        }
        headerIndexMap[headerName].push(i);
      }
    });

    for (const header of allowedHeaders) {
      if (!headerIndexMap[header] || headerIndexMap[header].length === 0) {
        notifications.show(
          `Opplasting feilet! Mangler kolonne: ${header}`,
          ERROR_NOTIFICATION,
        );
        return null;
      }
    }

    const parsedRows: ParsedRow<string[]>[] = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] ?? [];
      const parsedRow: Record<string, string | string[]> = {};

      for (const header of allowedHeaders) {
        const indices = headerIndexMap[header] ?? [];
        const values = indices
          .map((i) => (row[i] ?? "").trim())
          .filter((v) => v !== "");

        if (values.length === 0) {
          notifications.show(
            `Opplasting feilet! Rad nummer ${rowIndex + 1} mangler data for "${header}"`,
            ERROR_NOTIFICATION,
          );
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parsedRow[header] = values.length === 1 ? values[0]! : values;
      }

      parsedRows.push(parsedRow as ParsedRow<string[]>);
    }

    return parsedRows;
  }

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const csvText = reader.result as string;

      Papa.parse<string[]>(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: ({ data, errors }) => {
          if (errors.length) {
            notifications.show(
              "Klarte ikke lese CSV: " + errors,
              ERROR_NOTIFICATION,
            );
            return;
          }
          const parsedRows = parseRows(data);
          if (parsedRows !== null) {
            onUpload(parsedRows);
          }
        },
        error: (error: unknown) => {
          notifications.show(
            "Klarte ikke lese CSV: " + error,
            ERROR_NOTIFICATION,
          );
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
      loading={loading}
    />
  );
}
