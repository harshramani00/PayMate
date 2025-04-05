import React, { useState } from 'react';
import './ReceiptUpload.css';

const ReceiptUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const fileUrl = URL.createObjectURL(uploadedFile);
    setPreviewUrl(fileUrl);
    setMessage('');
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      setUploading(true);
      const res = await fetch('http://localhost:5000/server/receipt/scan-receipt', {
        method: 'POST',
        body: formData,
        credentials: 'include', // ensures cookies are sent for authentication
      });
      
      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Receipt uploaded successfully!');
        console.log(data);
        // Optionally navigate to a processing page or show progress bar
      } else {
        setMessage(`❌ Upload failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
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

            <div className="button-row">
              <button className="clear-btn" onClick={handleClear} disabled={uploading}>
                Clear
              </button>
              <button className="submit-btn" onClick={handleSubmit} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>

            {message && <p className="upload-message">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptUpload;
