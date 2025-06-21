import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const UploadReport = () => {
  const [reportFile, setReportFile] = useState(null);
  const [userId, setUserId] = useState('');

  const [bloodPressure, setBloodPressure] = useState([{ date: '', systolic: '', diastolic: '' }]);
  const [glucoseLevels, setGlucoseLevels] = useState([{ date: '', value: '' }]);
  const [heartRate, setHeartRate] = useState([{ date: '', bpm: '' }]);
  const [thyroidLevels, setThyroidLevels] = useState([{ date: '', tsh: '' }]); // 🆕

  const { aToken } = useContext(AdminContext);
  const { backendUrl } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile || !userId) {
      toast.error('Please provide all details.');
      return;
    }

    const chartData = {
      bloodPressure: bloodPressure.filter(row => row.date && row.systolic && row.diastolic),
      glucoseLevels: glucoseLevels.filter(row => row.date && row.value),
      heartRate: heartRate.filter(row => row.date && row.bpm),
      thyroidLevels: thyroidLevels.filter(row => row.date && row.tsh), // 🆕
    };

    const formData = new FormData();
    formData.append('report', reportFile);
    formData.append('userId', userId);
    formData.append('chartData', JSON.stringify(chartData));

    try {
      const res = await axios.post(`${backendUrl}/api/reports/upload`, formData, {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });
      toast.success(res.data.message);
      setReportFile(null);
      setUserId('');
      setBloodPressure([{ date: '', systolic: '', diastolic: '' }]);
      setGlucoseLevels([{ date: '', value: '' }]);
      setHeartRate([{ date: '', bpm: '' }]);
      setThyroidLevels([{ date: '', tsh: '' }]); // 🧹 reset
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const renderTable = (label, data, setData, fields) => (
    <div className="mb-6">
      <h4 className="text-md font-semibold mb-2">{label}</h4>
      {data.map((row, index) => (
        <div key={index} className="flex gap-2 mb-2 items-center">
          {fields.map(({ key, type, placeholder }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={row[key]}
              onChange={(e) => {
                const updated = [...data];
                updated[index][key] = e.target.value;
                setData(updated);
              }}
              className="border rounded px-3 py-1 w-1/3"
              required
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const updated = data.filter((_, i) => i !== index);
              setData(updated.length > 0 ? updated : [fields.reduce((obj, f) => ({ ...obj, [f.key]: '' }), {})]);
            }}
            className="text-red-600 hover:text-red-800 text-lg"
            title="Remove row"
          >
            ❌
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setData([...data, fields.reduce((obj, f) => ({ ...obj, [f.key]: '' }), {})])
        }
        className="text-sm text-blue-600 hover:underline"
      >
        ➕ Add Row
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="m-5 p-5 bg-white rounded shadow max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Upload Medical Report</h2>
      <div className="flex flex-col gap-4">

        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setReportFile(e.target.files[0])}
          className="border rounded px-3 py-2"
          required
        />

        {/* Blood Pressure Table */}
        {renderTable("Blood Pressure", bloodPressure, setBloodPressure, [
          { key: 'date', type: 'date', placeholder: 'Date' },
          { key: 'systolic', type: 'number', placeholder: 'Systolic' },
          { key: 'diastolic', type: 'number', placeholder: 'Diastolic' },
        ])}

        {/* Glucose Levels Table */}
        {renderTable("Glucose Levels", glucoseLevels, setGlucoseLevels, [
          { key: 'date', type: 'date', placeholder: 'Date' },
          { key: 'value', type: 'number', placeholder: 'Glucose (mg/dL)' },
        ])}

        {/* Heart Rate Table */}
        {renderTable("Heart Rate", heartRate, setHeartRate, [
          { key: 'date', type: 'date', placeholder: 'Date' },
          { key: 'bpm', type: 'number', placeholder: 'BPM' },
        ])}

        {/* 🆕 Thyroid Levels Table */}
        {renderTable("Thyroid Levels (TSH)", thyroidLevels, setThyroidLevels, [
          { key: 'date', type: 'date', placeholder: 'Date' },
          { key: 'tsh', type: 'number', placeholder: 'TSH (mIU/L)' },
        ])}

        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
          Upload
        </button>
      </div>
    </form>
  );
};

export default UploadReport;
