import React from "react";

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number; // 0 - 100
}

interface UploadProgressCardProps {
  uploads: UploadProgress[];
}

const UploadProgressCard: React.FC<UploadProgressCardProps> = ({ uploads }) => {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 space-y-3">
      {uploads.map((upload) => (
        <div
          key={upload.id}
          className="card shadow-lg border border-gray-300 rounded-lg p-4 bg-card text-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium truncate max-w-[180px]">
              {upload.filename}
            </span>
            <span className="text-xs text-gray-500">{upload.progress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 transition-all duration-300 ease-out"
              style={{ width: `${upload.progress}%` }}
            ></div>
          </div>

          {upload.progress === 100 && (
            <p className="text-green-600 text-xs mt-2">Upload selesai ✅</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default UploadProgressCard;
