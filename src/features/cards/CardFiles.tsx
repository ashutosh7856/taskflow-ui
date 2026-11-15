import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import PlayCircleOutlineRounded from "@mui/icons-material/PlayCircleOutlineRounded";
import UploadRounded from "@mui/icons-material/UploadRounded";
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { api, errorMessage } from "../../lib/api";

export type CardFile = {
  id: string;
  cardId: string;
  name: string;
  contentType: string;
  size: number;
  createdAt: string;
  url: string;
};

/** File links come back as API-relative paths; make them absolute. */
export function fileUrl(path: string) {
  return `${(api.defaults.baseURL || "").replace(/\/$/, "")}${path}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

const isImage = (type: string) => /^image\/(png|jpe?g|gif|webp|avif)$/.test(type);

function FileIcon({ type }: { type: string }) {
  if (type === "application/pdf") return <PictureAsPdfOutlined fontSize="small" />;
  if (type.startsWith("video/")) return <PlayCircleOutlineRounded fontSize="small" />;
  return <InsertDriveFileOutlined fontSize="small" />;
}

/** Grid of file tiles: image thumbnails, other types as a labelled tile. */
export function FileGrid({
  files,
  onDelete,
  deleting,
}: {
  files: CardFile[];
  onDelete?: (file: CardFile) => void;
  deleting?: string | null;
}) {
  return (
    <Box className="file-grid">
      {files.map((file) => (
        <Box key={file.id} className="file-tile">
          <a
            href={fileUrl(file.url)}
            target="_blank"
            rel="noreferrer"
            className="file-tile-preview"
            aria-label={`Open ${file.name}`}
          >
            {isImage(file.contentType) ? (
              <img src={fileUrl(file.url)} alt="" loading="lazy" />
            ) : (
              <span className="file-tile-icon">
                <FileIcon type={file.contentType} />
              </span>
            )}
          </a>
          <Stack direction="row" alignItems="center" gap={0.5} px={1} py={0.75}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" noWrap title={file.name}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatBytes(file.size)}
              </Typography>
            </Box>
            {onDelete && (
              <Tooltip title="Delete file">
                <span>
                  <IconButton
                    size="small"
                    aria-label={`Delete ${file.name}`}
                    disabled={deleting === file.id}
                    onClick={() => onDelete(file)}
                  >
                    <DeleteOutlineRounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

const ACCEPT =
  "image/*,application/pdf,video/mp4,video/webm,video/quicktime,audio/*,.zip,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.ttf,.otf,.woff,.woff2";

/** Files section inside the card drawer. */
export function CardFiles({ cardId }: { cardId: string }) {
  const client = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const files = useQuery({
    queryKey: ["card-files", cardId],
    queryFn: async () =>
      (await api.get<CardFile[]>(`/cards/${cardId}/files`)).data,
    retry: false,
  });

  const upload = useMutation({
    mutationFn: async (list: File[]) => {
      for (const [index, file] of list.entries()) {
        await api.post(`/cards/${cardId}/files`, file, {
          headers: {
            "Content-Type": file.type || "application/octet-stream",
            "X-File-Name": encodeURIComponent(file.name),
          },
          onUploadProgress: (event) => {
            const share = event.total ? event.loaded / event.total : 0;
            setProgress(((index + share) / list.length) * 100);
          },
        });
      }
    },
    onSettled: () => {
      setProgress(null);
      client.invalidateQueries({ queryKey: ["card-files", cardId] });
      client.invalidateQueries({ queryKey: ["billing"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (file: CardFile) => api.delete(`/files/${file.id}`),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["card-files", cardId] });
      client.invalidateQueries({ queryKey: ["billing"] });
    },
  });

  // Storage isn't switched on for this deployment yet: hide the section.
  if ((files.error as { response?: { status?: number } } | null)?.response?.status === 503)
    return null;

  const pick = (list: FileList | null) => {
    if (list?.length) upload.mutate(Array.from(list));
  };

  return (
    <Box
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        pick(event.dataTransfer.files);
      }}
    >
      <Stack direction="row" alignItems="center" mb={1}>
        <AttachFileRounded sx={{ mr: 1 }} />
        <Typography fontWeight={700}>Files</Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          startIcon={<UploadRounded />}
          disabled={upload.isPending}
          onClick={() => input.current?.click()}
        >
          Upload
        </Button>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          accept={ACCEPT}
          onChange={(event) => {
            pick(event.target.files);
            event.target.value = "";
          }}
        />
      </Stack>
      {progress !== null && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 1, borderRadius: 1 }}
          aria-label="Upload progress"
        />
      )}
      {upload.error ? (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {errorMessage(upload.error)}
        </Alert>
      ) : null}
      {remove.error ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          {errorMessage(remove.error)}
        </Alert>
      ) : null}
      {files.data?.length ? (
        <FileGrid
          files={files.data}
          onDelete={(file) => {
            if (window.confirm(`Delete “${file.name}”? This can't be undone.`))
              remove.mutate(file);
          }}
          deleting={remove.isPending ? remove.variables?.id : null}
        />
      ) : (
        !files.isLoading && (
          <Typography
            variant="body2"
            color="text.secondary"
            className="file-dropzone"
            onClick={() => input.current?.click()}
          >
            Drop designs, drafts or videos here. Files on client-visible cards
            show up in the client portal.
          </Typography>
        )
      )}
    </Box>
  );
}
