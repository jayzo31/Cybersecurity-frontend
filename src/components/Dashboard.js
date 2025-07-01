import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusIcon, 
  FileIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DownloadIcon,
  EyeIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/documents');
      console.log('Documents API Response:', response);
      setDocuments(response.data.documents);

      // Calculate stats
      const stats = response.data.documents.reduce((acc, doc) => {
        acc.total++;
        acc[doc.status]++;
        return acc;
      }, { total: 0, processing: 0, completed: 0, failed: 0 });

      setStats(stats);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your cybersecurity documentation and analysis results
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link
            to="/upload"
            rel="noopener noreferrer"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            data-cy="upload-button"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8">
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="px-4 py-5 bg-white overflow-hidden shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Documents
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.total}
            </dd>
          </div>
          <div className="px-4 py-5 bg-white overflow-hidden shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Processing
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
              {stats.processing}
            </dd>
          </div>
          <div className="px-4 py-5 bg-white overflow-hidden shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Completed
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {stats.completed}
            </dd>
          </div>
          <div className="px-4 py-5 bg-white overflow-hidden shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Failed
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">
              {stats.failed}
            </dd>
          </div>
        </dl>
      </div>

      {/* Documents List */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Documents
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your uploaded documents and their analysis status
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first cybersecurity document.
              </p>
              <div className="mt-6">
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Upload Document
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documents.map((document) => (
                <li key={document.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(document.status)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {document.originalName}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-badge status-${document.status}`}>
                            {document.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Uploaded {formatDate(document.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {document.status === 'completed' && (
                        <>
                          <Link
                            to={`/analysis/${document.id}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => window.open(`/api/documents/${document.id}/download`, '_blank')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}