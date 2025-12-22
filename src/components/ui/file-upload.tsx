import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, File, Image, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FileUploadProps {
  /** Accepted file types (e.g., ".pdf,.jpg,.png" or "image/*,application/pdf") */
  accept?: string;
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Whether multiple files can be uploaded */
  multiple?: boolean;
  /** Callback when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Callback when a file is removed */
  onFileRemoved?: (file: File) => void;
  /** Callback when upload starts (for integration with upload API) */
  onUploadStart?: (file: File) => void;
  /** Current uploaded file URL (for displaying preview after upload) */
  uploadedUrl?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Custom class name */
  className?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith("image/")) {
    return <Image className="h-8 w-8 text-primary" />;
  }
  if (file.type === "application/pdf") {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <File className="h-8 w-8 text-muted-foreground" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept = ".pdf,.jpg,.jpeg,.png",
      maxSize = 5 * 1024 * 1024, // 5MB default
      multiple = false,
      onFilesSelected,
      onFileRemoved,
      onUploadStart,
      uploadedUrl,
      disabled = false,
      error,
      isUploading = false,
      uploadProgress = 0,
      className,
      label,
      helperText,
    },
    ref
  ) => {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [dragActive, setDragActive] = React.useState(false);
    const [localError, setLocalError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const displayError = error || localError;

    const validateFile = (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`;
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
        const fileType = file.type.toLowerCase();
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

        const isAccepted = acceptedTypes.some((accepted) => {
          if (accepted.startsWith(".")) {
            return fileExtension === accepted;
          }
          if (accepted.endsWith("/*")) {
            return fileType.startsWith(accepted.replace("/*", "/"));
          }
          return fileType === accepted;
        });

        if (!isAccepted) {
          return `File type not accepted. Allowed: ${accept}`;
        }
      }

      return null;
    };

    const handleFiles = (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      setLocalError(null);
      const validFiles: File[] = [];

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          setLocalError(validationError);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
        setSelectedFiles(newFiles);
        onFilesSelected?.(newFiles);
        if (onUploadStart && validFiles[0]) {
          onUploadStart(validFiles[0]);
        }
      }
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;

      handleFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const removeFile = (fileToRemove: File) => {
      const newFiles = selectedFiles.filter((f) => f !== fileToRemove);
      setSelectedFiles(newFiles);
      onFileRemoved?.(fileToRemove);
      onFilesSelected?.(newFiles);
    };

    const openFileDialog = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}

        {/* Drop Zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
            disabled && "opacity-50 cursor-not-allowed",
            displayError && "border-destructive"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : uploadedUrl ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-accent" />
                <p className="text-sm text-muted-foreground">File uploaded successfully</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                >
                  Replace File
                </Button>
              </>
            ) : (
              <>
                <Upload
                  className={cn(
                    "h-10 w-10",
                    dragActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {dragActive ? "Drop file here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accept.replace(/\./g, "").toUpperCase().split(",").join(", ")} up to{" "}
                    {formatFileSize(maxSize)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="flex items-center gap-1.5 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{displayError}</p>
          </div>
        )}

        {/* Helper Text */}
        {helperText && !displayError && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && !uploadedUrl && (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  getFileIcon(file)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
