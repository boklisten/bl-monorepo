import { FileInput } from "@mantine/core";
import { IconFileUpload } from "@tabler/icons-react";
import Papa from "papaparse";

import { showErrorNotification } from "@/shared/utils/notifications";

type ParsedRow<
  Req extends readonly string[],
  Opt extends readonly string[] = [],
> = Record<Req[number], string | string[]> &
  Partial<Record<Opt[number], string | string[]>>;

export default function UploadCSVFile<
  Req extends readonly string[],
  Opt extends readonly string[] = [],
>({
  label,
  requiredHeaders,
  optionalHeaders,
  onUpload,
}: {
  label: string;
  requiredHeaders: Req;
  optionalHeaders?: Opt;
  onUpload: (data: ParsedRow<Req, Opt>[]) => void;
}) {
  function parseRows(rows: string[][]): ParsedRow<Req, Opt>[] | null {
    if (rows.length < 2) {
      showErrorNotification({
        title: "Opplasting feilet!",
        message: "Filen har ingen data",
      });
      return null;
    }

    const headerRow = rows[0]?.map((h) => h.trim()) ?? [];
    const allHeaders = [
      ...requiredHeaders,
      ...(optionalHeaders ?? []),
    ] as readonly string[];

    const headerIndexMap: Record<string, number[]> = {};
    headerRow.forEach((headerName, i) => {
      if (allHeaders.includes(headerName)) {
        if (!headerIndexMap[headerName]) {
          headerIndexMap[headerName] = [];
        }
        headerIndexMap[headerName].push(i);
      }
    });

    for (const header of requiredHeaders) {
      if (!headerIndexMap[header] || headerIndexMap[header].length === 0) {
        showErrorNotification({
          title: "Opplasting feilet!",
          message: `Mangler kolonne: ${header}`,
        });
        return null;
      }
    }

    const parsedRows: ParsedRow<Req, Opt>[] = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] ?? [];
      const parsedRow: Partial<Record<string, string | string[]>> = {};

      for (const header of requiredHeaders) {
        const indices = headerIndexMap[header] ?? [];
        const values = indices
          .map((i) => (row[i] ?? "").trim())
          .filter((v) => v !== "");

        if (values.length === 0) {
          showErrorNotification({
            title: "Opplasting feilet!",
            message: `Rad nummer ${rowIndex + 1} mangler data for "${header}"`,
          });
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parsedRow[header] = values.length === 1 ? values[0]! : values;
      }

      for (const header of optionalHeaders ?? []) {
        const indices = headerIndexMap[header] ?? [];
        if (indices.length === 0) continue;

        const values = indices
          .map((i) => (row[i] ?? "").trim())
          .filter((v) => v !== "");

        if (values.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          parsedRow[header] = values.length === 1 ? values[0]! : values;
        }
      }

      parsedRows.push(parsedRow as ParsedRow<Req, Opt>);
    }

    return parsedRows;
  }

  function handleUpload(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const csvText = reader.result as string;

      Papa.parse<string[]>(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: ({ data, errors }) => {
          if (errors.length) {
            showErrorNotification({
              title: "Klarte ikke lese CSV",
              message: errors.join(", "),
            });
            return;
          }
          const parsedRows = parseRows(data);
          if (parsedRows !== null) {
            onUpload(parsedRows);
          }
        },
        error: (error: unknown) => {
          showErrorNotification({
            title: "Klarte ikke lese CSV",
            message: "" + error,
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
    <FileInput
      label={label}
      placeholder={"Velg fil (csv)"}
      leftSection={<IconFileUpload />}
      onChange={handleUpload}
      accept="csv,text/csv"
      clearable
    />
  );
}
