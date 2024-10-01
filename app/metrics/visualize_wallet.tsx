'use client';

import React, { useState } from 'react';
import { visualizeDataset } from '@/utilities/apiUtils';

const VisualizeWallet: React.FC = () => {
  const [sourceType, setSourceType] = useState<'local' | 'firebase' | 'address'>('address');
  const [address, setAddress] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [maxNodes, setMaxNodes] = useState<number | null>(null);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setVisualizationUrl(null);

    try {
      const response = await visualizeDataset({
        sourceType,
        address: sourceType === 'address' ? address : null,
        filename: sourceType !== 'address' ? filename : null,
        maxNodes,
      });

      if (response.visualization_url) {
        setVisualizationUrl(response.visualization_url);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error visualizing dataset:', err);
      setError('Failed to visualize dataset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content bg-background-color flex flex-col items-center text-center p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Visualize Wallet Relationships</h1>

      <div className="form-container w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        {/* Source Type Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Source Type</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as 'local' | 'firebase' | 'address')}
            className="w-full p-2 border rounded focus:outline-none"
          >
            <option value="address">Ethereum Address</option>
            <option value="local">Local Dataset</option>
            <option value="firebase">Firebase Dataset</option>
          </select>
        </div>

        {/* Ethereum Address Input */}
        {sourceType === 'address' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Ethereum Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Ethereum address"
              className="w-full p-2 border rounded focus:outline-none"
            />
          </div>
        )}

        {/* Filename Input for Local/Firebase */}
        {(sourceType === 'local' || sourceType === 'firebase') && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="w-full p-2 border rounded focus:outline-none"
            />
          </div>
        )}

        {/* Max Nodes Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Max Nodes</label>
          <input
            type="number"
            value={maxNodes || ''}
            onChange={(e) => setMaxNodes(Number(e.target.value))}
            placeholder="Max nodes to visualize"
            className="w-full p-2 border rounded focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="mb-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-neorange text-white py-2 rounded hover:bg-neohover"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Visualize'}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Visualization Link */}
        {visualizationUrl && (
          <div className="visualization-container mt-4">
            <p className="text-green-500">Visualization generated:</p>
            <a
              href={visualizationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Visualization
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        .visualize-wallet-page {
          background-color: #f7f9fc;
          padding: 20px;
        }
        .form-container {
          width: 100%;
          max-width: 600px;
        }
      `}</style>
    </div>
  );
};

export default VisualizeWallet;
