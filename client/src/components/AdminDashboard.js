import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const AdminDashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'application/pdf',
    onDrop: async (acceptedFiles) => {
      setLoading(true);
      const formData = new FormData();
      formData.append('pdf', acceptedFiles[0]);

      try {
        const response = await fetch('/api/upload-pdf', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setModules(data.sections);
      } catch (error) {
        console.error('Error uploading PDF:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="upload-section" {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag and drop a PDF here, or click to select</p>
      </div>

      {loading && <div>Processing PDF...</div>}

      <div className="modules-section">
        <h2>Course Modules</h2>
        {modules.map((module, index) => (
          <div key={index} className="module-card">
            <h3>{module.title}</h3>
            <div className="module-actions">
              <button onClick={() => {}}>Edit</button>
              <button onClick={() => {}}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-section">
        <h2>Student Analytics</h2>
        {/* Analytics components will be added here */}
      </div>
    </div>
  );
};

export default AdminDashboard;
