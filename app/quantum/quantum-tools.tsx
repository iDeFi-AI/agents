import React, { useState } from 'react';
import { quantumRiskAnalysis, portfolioOptimization, compileAndRunQASM } from '@/utilities/apiUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faChartLine, faCode, faLaptopCode, faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react'; // Tooltip for additional info
import 'tippy.js/dist/tippy.css'; // Tippy.js for tooltips

const QuantumCategory: React.FC = () => {
  const [portfolio, setPortfolio] = useState<string>(''); // Portfolio data input by the user
  const [qasmFile, setQasmFile] = useState<string>(''); // QASM file input for quantum execution
  const [riskAnalysisResult, setRiskAnalysisResult] = useState<any | null>(null); // Risk analysis result
  const [optimizationResult, setOptimizationResult] = useState<any | null>(null); // Portfolio optimization result
  const [qasmResult, setQasmResult] = useState<string | null>(null); // QASM execution result
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perform quantum risk analysis
  const handleQuantumRiskAnalysis = async () => {
    if (!portfolio) {
      setErrorMessage('Please provide a valid portfolio.');
      return;
    }

    setLoading(true);
    try {
      const result = await quantumRiskAnalysis(portfolio);
      setRiskAnalysisResult(result);
    } catch (error) {
      setErrorMessage('Error during quantum risk analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Perform portfolio optimization
  const handlePortfolioOptimization = async () => {
    if (!portfolio) {
      setErrorMessage('Please provide a valid portfolio.');
      return;
    }

    setLoading(true);
    try {
      const result = await portfolioOptimization(portfolio);
      setOptimizationResult(result);
    } catch (error) {
      setErrorMessage('Error during portfolio optimization.');
    } finally {
      setLoading(false);
    }
  };

  // Compile and run QASM
  const handleCompileAndRunQASM = async () => {
    if (!qasmFile) {
      setErrorMessage('Please provide a valid QASM file name.');
      return;
    }

    setLoading(true);
    try {
      const result = await compileAndRunQASM(qasmFile, true); // Assuming useIBMBackend is true
      setQasmResult(result);
    } catch (error) {
      setErrorMessage('Error during QASM execution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Quantum Category Tools</h2>

      {/* Overview Section */}
      <div className="mb-6">
        <Tippy content="Leverage quantum technology to enhance portfolio management and run complex calculations.">
          <h3 className="text-xl font-semibold mb-2">Quantum Tools Overview</h3>
        </Tippy>
        <p className="text-gray-600">
          In this section, you can perform advanced risk analysis and optimize portfolios using quantum computing. You
          can also compile and run QASM files directly through quantum backends.
        </p>
      </div>

      {/* Input for Portfolio */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Portfolio Input</h4>
        <textarea
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          placeholder="Enter portfolio data (JSON format)"
          className="border p-2 rounded-md w-full mb-4"
          rows={5}
        />
        <button
          onClick={handleQuantumRiskAnalysis}
          className="py-2 px-4 bg-neorange text-white rounded mr-4 hover:bg-neorange-dark"
        >
          <FontAwesomeIcon icon={faBolt} className="mr-2" />
          Perform Quantum Risk Analysis
        </button>

        <button
          onClick={handlePortfolioOptimization}
          className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          Optimize Portfolio
        </button>
      </div>

      {/* Input for QASM file */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">QASM File</h4>
        <input
          type="text"
          value={qasmFile}
          onChange={(e) => setQasmFile(e.target.value)}
          placeholder="Enter QASM file name"
          className="border p-2 rounded-md w-full mb-4"
        />
        <button
          onClick={handleCompileAndRunQASM}
          className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FontAwesomeIcon icon={faCode} className="mr-2" />
          Compile & Run QASM
        </button>
      </div>

      {/* Error Messages */}
      {errorMessage && (
        <p className="mt-4 text-red-500">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
          {errorMessage}
        </p>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-neorange text-3xl" />
        </div>
      )}

      {/* Quantum Risk Analysis Result */}
      {riskAnalysisResult && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold">Quantum Risk Analysis Result</h4>
          <pre className="bg-gray-100 p-4 rounded-md">{JSON.stringify(riskAnalysisResult, null, 2)}</pre>
        </div>
      )}

      {/* Portfolio Optimization Result */}
      {optimizationResult && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold">Portfolio Optimization Result</h4>
          <pre className="bg-gray-100 p-4 rounded-md">{JSON.stringify(optimizationResult, null, 2)}</pre>
        </div>
      )}

      {/* QASM Execution Result */}
      {qasmResult && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold">QASM Execution Result</h4>
          <pre className="bg-gray-100 p-4 rounded-md">{JSON.stringify(qasmResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default QuantumCategory;
