import React, { useState } from 'react';
import './ReceiptUpload.css';

const ReceiptUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const fileUrl = URL.createObjectURL(uploadedFile);
    setPreviewUrl(fileUrl);
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="upload-container">
      <h2>Upload Your Receipt</h2>

      <div className="upload-box">
        {!file ? (
          <label htmlFor="file-upload" className="upload-label">
            Click or drag a file here
            <input
              type="file"
              id="file-upload"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              hidden
            />
          </label>
        ) : (
          <div className="preview">
            {file.type.startsWith('image/') ? (
              <img src={previewUrl} alt="Receipt Preview" />
            ) : file.type === 'application/pdf' ? (
              <iframe
                title="PDF Preview"
                src={previewUrl}
                frameBorder="0"
                width="100%"
                height="400px"
              ></iframe>
            ) : (
              <p>Unsupported file type</p>
            )}
            <button className="clear-btn" onClick={handleClear}>
              Clear
            </button>
            <button className="submit-btn">
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptUpload;
