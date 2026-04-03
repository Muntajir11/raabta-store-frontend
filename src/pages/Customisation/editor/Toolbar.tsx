import type { FC } from 'react';

type ToolbarProps = {
  onAddImage: (fileList: FileList | null) => void;
  onAddText: () => void;
  onDelete: () => void;
  canDelete: boolean;
};

export const Toolbar: FC<ToolbarProps> = ({ onAddImage, onAddText, onDelete, canDelete }) => (
  <div className="editor-toolbar">
    <div className="editor-actions">
      <label className="editor-action-btn">
        Upload image
        <input type="file" accept="image/*" hidden onChange={(e) => onAddImage(e.target.files)} />
      </label>
      <button type="button" className="editor-action-btn" onClick={onAddText}>
        Add text
      </button>
      <button type="button" className="editor-action-btn danger" disabled={!canDelete} onClick={onDelete}>
        Delete
      </button>
    </div>
  </div>
);
