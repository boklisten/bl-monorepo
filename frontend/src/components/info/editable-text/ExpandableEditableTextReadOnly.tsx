"use client";

import { Box, Button, Collapse } from "@mui/material";
import { useState } from "react";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export default function ExpandableEditableTextReadOnly({
  dataKey,
  cachedText,
  collapsedSize = 150,
}: {
  dataKey: string;
  cachedText: string;
  collapsedSize?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box>
      <Box sx={{ position: "relative" }}>
        <Collapse in={expanded} collapsedSize={collapsedSize}>
          <EditableTextReadOnly dataKey={dataKey} cachedText={cachedText} />
        </Collapse>

        {!expanded && (
          <Box
            sx={{
              pointerEvents: "none",
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 80,
              background: (theme) =>
                `linear-gradient(to bottom, rgba(255,255,255,0), ${theme.palette.background.paper})`,
            }}
          />
        )}
      </Box>

      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Button onClick={() => setExpanded((prev) => !prev)} variant="text">
          {expanded ? "Vis mindre" : "Vis mer"}
        </Button>
      </Box>
    </Box>
  );
}
