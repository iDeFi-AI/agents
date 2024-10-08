import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

// Make onDataSync optional using ?
const DataUpload: React.FC<{ onDataSync?: (data: any) => void }> = ({ onDataSync }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [fileDownloadUrl, setFileDownloadUrl] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadStatus('Uploading...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadResults(data.details);
        setFileDownloadUrl(data.file_url);
        setUploadStatus('File uploaded and processed successfully.');

        // Trigger onDataSync if it exists
        if (onDataSync) {
          onDataSync(data.details);
        }
      } else {
        const errorData = await response.json();
        setUploadStatus(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setUploadStatus('File upload failed.');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
      <h2 style={{ fontSize: '16px', color: '#333', fontWeight: 600, marginBottom: '10px' }}>
        Upload Dataset
      </h2>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv,.json"
          style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
        />
      </div>

      <button
        onClick={handleFileUpload}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007bff', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.3s ease' }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
      >
        <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} />
        Upload File
      </button>

      <div>
        {uploadStatus && (
          <p style={{ color: '#666', fontSize: '14px' }}>{uploadStatus}</p>
        )}
        {fileDownloadUrl && (
          <div>
            <a
              href={fileDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Download Processed Results
            </a>
          </div>
        )}
      </div>

      {uploadResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>
            Processing Results
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {uploadResults.map((result, index) => (
              <li key={index} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '14px' }}>
                <p><strong>Address:</strong> {result.address}</p>
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Description:</strong> {result.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataUpload;
