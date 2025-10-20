import { X, FileText, FileImage, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadPreviewProps {
  file: File;
  onRemove: () => void;
}

export const FileUploadPreview = ({ file, onRemove }: FileUploadPreviewProps) => {
  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  
  const getFileIcon = () => {
    if (isImage) return <FileImage className="w-5 h-5" />;
    if (isPDF) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="flex items-center gap-2 bg-secondary rounded-lg p-2 pr-1 border border-border">
      <div className="text-primary">{getFileIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
