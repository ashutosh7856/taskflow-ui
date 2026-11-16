import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import {
  Box,
  Checkbox,
  IconButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { FieldValue, TemplateField, Workflow } from "../../lib/workflows";

/**
 * The fields this kind of work needs (platforms and caption for a social
 * post, proof link and revision round for a design…). Each change saves
 * just that field.
 */
export function CardFields({
  workflow,
  values,
  onSave,
}: {
  workflow: Workflow;
  values: Record<string, FieldValue> | null | undefined;
  onSave: (patch: Record<string, FieldValue | null>) => void;
}) {
  if (!workflow.fields.length) return null;
  return (
    <Box>
      <Stack direction="row" alignItems="baseline" gap={1} mb={1.5}>
        <Typography fontWeight={700}>
          {workflow.cardNoun.charAt(0).toUpperCase() +
            workflow.cardNoun.slice(1)}{" "}
          details
        </Typography>
        <Typography
          fontSize={12}
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <VisibilityRounded sx={{ fontSize: 14 }} /> = client sees it in the
          portal
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
          gap: 1.5,
        }}
      >
        {workflow.fields.map((field) => (
          <Box
            key={field.key}
            sx={{ gridColumn: field.type === "longtext" ? "1 / -1" : "auto" }}
          >
            <FieldInput
              field={field}
              value={values?.[field.key]}
              onSave={(value) => onSave({ [field.key]: value })}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function FieldInput({
  field,
  value,
  onSave,
}: {
  field: TemplateField;
  value: FieldValue | undefined;
  onSave: (value: FieldValue | null) => void;
}) {
  const label = (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
      {field.label}
      {field.client && (
        <VisibilityRounded
          aria-label="Visible to the client"
          sx={{ fontSize: 14, ml: 0.5, color: "text.secondary" }}
        />
      )}
    </Box>
  );
  const common = {
    fullWidth: true,
    size: "small" as const,
    label,
    InputLabelProps: { shrink: true },
  };

  if (field.type === "select")
    return (
      <TextField
        {...common}
        select
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onSave(event.target.value || null)}
      >
        <MenuItem value="">
          <em>Not set</em>
        </MenuItem>
        {field.options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    );

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <TextField
        {...common}
        select
        SelectProps={{
          multiple: true,
          renderValue: (items) => (items as string[]).join(", "),
        }}
        value={selected}
        onChange={(event) => {
          const next = event.target.value as unknown as string[];
          onSave(next.length ? next : null);
        }}
      >
        {field.options?.map((option) => (
          <MenuItem key={option} value={option} dense>
            <Checkbox size="small" checked={selected.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </TextField>
    );
  }

  const text = value === undefined ? "" : String(value);
  const isUrl = field.type === "url";
  return (
    <TextField
      {...common}
      // Remount when the saved value changes so the field shows it.
      key={`${field.key}-${text}`}
      defaultValue={field.type === "date" ? text.slice(0, 10) : text}
      type={
        field.type === "number"
          ? "number"
          : field.type === "date"
            ? "date"
            : isUrl
              ? "url"
              : "text"
      }
      multiline={field.type === "longtext"}
      minRows={field.type === "longtext" ? 3 : undefined}
      placeholder={field.placeholder}
      onBlur={(event) => {
        if (field.type === "date") return;
        const next = event.target.value.trim();
        if (next === text) return;
        if (!next) return onSave(null);
        if (field.type === "number") return onSave(Number(next));
        if (isUrl && !/^https?:\/\//i.test(next))
          return onSave(`https://${next}`);
        onSave(next);
      }}
      onChange={
        field.type === "date"
          ? (event) => onSave(event.target.value || null)
          : undefined
      }
      InputProps={
        isUrl && text
          ? {
              endAdornment: (
                <Tooltip title="Open link">
                  <IconButton
                    size="small"
                    component="a"
                    href={text}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${field.label}`}
                  >
                    <OpenInNewRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              ),
            }
          : undefined
      }
    />
  );
}
