import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

type PhotoUploadProps = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  error?: string;
};

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export default function PhotoUpload({ value, onChange, error }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    setLocalError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setLocalError('Please use PNG, JPG, WEBP, or GIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError('Image must be under 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clear = () => {
    onChange(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const showError = error || localError;

  return (
    <div className="w-full">
      <label className="label">Profile photo</label>
      {value ? (
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-slate-100">
            <img src={value} alt="Profile preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary">
              <Upload className="h-4 w-4" /> Replace
            </button>
            <button type="button" onClick={clear} className="btn-ghost text-error-600 hover:bg-error-50">
              <X className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 ${
            dragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50'
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft">
            <ImageIcon className="h-5 w-5 text-slate-500" />
          </span>
          <p className="text-sm font-medium text-slate-700">
            <span className="text-brand-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">PNG, JPG, WEBP or GIF — up to 4MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={onPick}
        className="hidden"
      />
      {showError && <p className="error-text">{showError}</p>}
    </div>
  );
}
