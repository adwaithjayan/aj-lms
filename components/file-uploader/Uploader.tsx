"use client";

import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn, useConstructUrl } from "@/lib/utils";
import {
  RenderEmptyState,
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from "./renderState";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

interface iAppProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Uploader({ value, onChange }: iAppProps) {
  const fileUrl = useConstructUrl(value || "");

  const [fileState, setFileState] = useState<UploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
    key: value,
    objectUrl: fileUrl,
  });

  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        const file = files[0];

        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }

        setFileState({
          file: file,
          uploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          error: false,
          id: uuid(),
          isDeleting: false,
          fileType: "image",
        });
        uploadFile(file);
      }
    },
    [fileState.objectUrl]
  );

  async function handelRemoeFile() {
    if (fileState.isDeleting || !fileState.objectUrl) return;

    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      const res = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: fileState.key,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to remove file from storage");
        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
        }));
        return;
      }
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
      onChange?.("");
      setFileState(() => ({
        file: null,
        uploading: false,
        progress: 0,
        objectUrl: undefined,
        error: false,
        id: null,
        isDeleting: false,
        fileType: "image",
      }));

      toast.success("File removed successfully");
    } catch {
      toast.error("Failed to remove file please try again later.");
      setFileState((prev) => ({
        ...prev,
        error: true,
        isDeleting: false,
      }));
    }
  }

  async function uploadFile(file: File) {
    setFileState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }));

    try {
      const presignedResponce = await fetch("/api/s3/upload", {
        method: "POSt",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });
      if (!presignedResponce.ok) {
        toast.error("Failed to get presigned url");
        setFileState((prev) => ({
          ...prev,
          error: true,
          progress: 0,
          uploading: false,
        }));
      }
      const { presignedUrl, key } = await presignedResponce.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const precentegeCompleted = (e.loaded / e.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(precentegeCompleted),
            }));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) => ({
              ...prev,
              progress: 100,
              uploading: false,
              key: key,
            }));
            onChange?.(key);

            toast.success("File uploaded succesfully");

            resolve();
          } else {
            reject(new Error("Uplaod failed"));
          }
        };
        xhr.onerror = () => {
          reject(new Error("Uploade failed"));
        };
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch {
      toast.error("Something went wrone");
      setFileState((prev) => ({
        ...prev,
        progress: 0,
        error: true,
        uploading: false,
      }));
    }
  }

  function rejectedFile(fileReject: FileRejection[]) {
    if (fileReject.length) {
      const tomanyFiles = fileReject.find(
        (reject) => reject.errors[0].code === "too-many-files"
      );
      const fileSize = fileReject.find(
        (reject) => reject.errors[0].code === "file-too-large"
      );
      if (tomanyFiles) {
        toast.error("Too many files selected");
      }
      if (fileSize) {
        toast.error("File size exceeds the limit");
      }
    }
  }

  function renderContent(isDragActive: boolean) {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          file={fileState.file as File}
          preogress={fileState.progress}
        />
      );
    }
    if (fileState.error) {
      return <RenderErrorState />;
    }
    if (fileState.objectUrl) {
      return (
        <RenderUploadedState
          previewUrl={fileState.objectUrl}
          isDeleting={fileState.isDeleting}
          handleRemoveFile={handelRemoeFile}
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024, //5mb
    onDropRejected: rejectedFile,
    disabled: fileState.uploading || !!fileState.objectUrl,
  });
  return (
    <Card
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}
      {...getRootProps()}
    >
      <CardContent className="w-full flex items-center justify-center h-full p-4">
        <input {...getInputProps()} />
        {renderContent(isDragActive)}
      </CardContent>
    </Card>
  );
}
