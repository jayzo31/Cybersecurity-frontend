import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UploadIcon, 
  FileIcon, 
  XIcon,
  CheckIcon
} from 'lucide-react';

export default function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [llmProvider, setLLMProvider] = useState('claude');
  const [analysisType, setAnalysisType] = useState('full');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('llmProvider', llmProvider);
    formData.append('analysisType', analysisType);

    try {
      const response = await axios.post('/documents/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      toast.success('Document uploaded and analysis started!');
      navigate(`/analysis/${response.data.data.document.id}`);
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Document Analysis
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Upload your cybersecurity document for AI-powered analysis and compliance checking.
            </p>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Supported formats:</h4>
              <ul className="mt-2 text-sm text-gray-600">
                <li>• PDF documents</li>
                <li>• Word documents (.docx)</li>
                <li>• Text files (.txt)</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Document
                  </label>
                  <div className="mt-1">
                    {!selectedFile ? (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        data-cy="file-input"
                      >
                        <input {...getInputProps()} />
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {isDragActive
                            ? 'Drop the file here...'
                            : 'Drag and drop a file here, or click to select'}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileIcon className="h-8 w-8 text-gray-400" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="ml-3 text-gray-400 hover:text-gray-500"
                          >
                            <XIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* LLM Provider */}
                <div>
                  <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700">
                    AI Provider
                  </label>
                  <select
                    id="llmProvider"
                    name="llmProvider"
                    value={llmProvider}
                    onChange={(e) => setLLMProvider(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    data-cy="llm-provider"
                  >
                    <option value="claude">Claude (Anthropic) - Best for policy analysis</option>
                    <option value="openai">OpenAI GPT-4 - Excellent for creative improvements</option>
                    <option value="azure">Azure OpenAI - Enterprise-grade processing</option>
                    <option value="gemini">Google Gemini - Fast and accurate</option>
                  </select>
                </div>

                {/* Analysis Type */}
                <div>
                  <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700">
                    Analysis Type
                  </label>
                  <select
                    id="analysisType"
                    name="analysisType"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    data-cy="analysis-type"
                  >
                    <option value="compliance">Compliance Check - Verify against standards</option>
                    <option value="gap-analysis">Gap Analysis - Identify missing controls</option>
                    <option value="full">Full Analysis - Comprehensive review</option>
                  </select>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                        data-cy="progress-bar"
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-cy="analyze-button"
                >
                  {uploading ? (
                    <>
                      <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="-ml-1 mr-2 h-5 w-5" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}