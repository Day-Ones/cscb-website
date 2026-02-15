import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    studentNumber: '',
    lastName: '',
    firstName: '',
    program: '',
    yearLevel: ''
  });
  
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [registrationData, setRegistrationData] = useState(null);
  const canvasRef = useRef(null);

  // UseEffect to generate QR code when registration is complete and canvas is ready
  useEffect(() => {
    if (isRegistered && registrationData && canvasRef.current) {
      generateQRCode(registrationData);
    }
  }, [isRegistered, registrationData]);

  const programs = [
    'Bachelor of Science in Information Technology',
    'Diploma in Information Technology'
  ];

  const getYearLevels = (program) => {
    if (program === 'Bachelor of Science in Information Technology') {
      return ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    } else if (program === 'Diploma in Information Technology') {
      return ['1st Year', '2nd Year', '3rd Year'];
    }
    return [];
  };

  const calculateProgress = () => {
    // Base fields that are always visible
    const baseFields = ['studentNumber', 'lastName', 'firstName', 'program'];
    const baseFilledFields = baseFields.filter(field => formData[field] !== '').length;
    
    // If program is selected, include yearLevel in calculation
    if (formData.program) {
      const totalFields = 5;
      const totalFilledFields = formData.yearLevel ? baseFilledFields + 1 : baseFilledFields;
      return (totalFilledFields / totalFields) * 100;
    }
    
    // If program is not selected, calculate based on base fields only
    return (baseFilledFields / baseFields.length) * 100;
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'studentNumber' && value) {
      // Format: YYYY-NNNNN-TG-0 (e.g., 2023-00000-TG-0)
      const studentIdPattern = /^\d{4}-\d{5}-TG-0$/;
      if (!studentIdPattern.test(value)) {
        error = 'Student ID must follow format: YYYY-NNNNN-TG-0 (e.g., 2023-00000-TG-0)';
      }
    }
    
    if ((name === 'lastName' || name === 'firstName') && value && !/^[a-zA-Z\s]+$/.test(value)) {
      error = 'Name should contain only letters';
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate field
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Reset year level when program is changed
    if (name === 'program') {
      setFormData(prevData => ({
        ...prevData,
        yearLevel: ''
      }));
    }
  };

  const generateStaticIdentity = () => {
    const timestamp = new Date().toISOString();
    const identity = {
      studentNumber: formData.studentNumber,
      fullName: `${formData.firstName} ${formData.lastName}`,
      program: formData.program,
      yearLevel: formData.yearLevel,
      registrationDate: timestamp,
      id: `CSCB-${formData.studentNumber}-${Date.now()}`
    };
    
    return identity;
  };

  const generateQRCode = async (identity) => {
    try {
      console.log('Starting QR code generation with data:', identity);
      const qrData = JSON.stringify(identity);
      const canvas = canvasRef.current;
      
      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }

      console.log('Canvas found, generating QR code...');
      
      // Clear canvas first
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Generate QR code directly to canvas
      await QRCode.toCanvas(canvas, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Get the data URL from canvas
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeUrl(dataUrl);
      console.log('QR Code generated successfully, dataUrl length:', dataUrl.length);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.studentNumber || !formData.lastName || !formData.firstName || 
        !formData.program || !formData.yearLevel) {
      alert('Please fill in all fields');
      return;
    }

    // Check for field errors
    const hasErrors = Object.values(fieldErrors).some(error => error !== '');
    if (hasErrors) {
      alert('Please fix the errors before submitting');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const identity = generateStaticIdentity();
      
      // Store the registration data (in a real app, this would be sent to a backend)
      localStorage.setItem(`student_${formData.studentNumber}`, JSON.stringify(identity));
      
      // Store registration data for QR generation
      setRegistrationData(identity);
      setIsRegistered(true);
      setShowModal(true);
      
      console.log('Registration completed, QR code generation will be triggered by useEffect');
    } catch (error) {
      alert('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${formData.firstName}_${formData.lastName}_QRCode.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const resetForm = () => {
    setFormData({
      studentNumber: '',
      lastName: '',
      firstName: '',
      program: '',
      yearLevel: ''
    });
    setQrCodeUrl('');
    setIsRegistered(false);
    setShowModal(false);
    setFieldErrors({});
    setRegistrationData(null);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="registration-container">
      <div className="logo-container">
        <img src="/cs-logo.png" alt="CS Logo" className="logo" />
      </div>
      <h1 className="title">CSCB Student Registration</h1>
      
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registration Successful</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Your registration has been completed successfully!</p>
              <p>You can now download your QR code below.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {!isRegistered ? (
        <form onSubmit={handleSubmit}>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.round(calculateProgress())}% Complete</p>
          </div>

          <div className="form-columns">
            <div className="form-group full-width">
              <label htmlFor="studentNumber" className="form-label">
                Student Number *
              </label>
              <input
                type="text"
                id="studentNumber"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleInputChange}
                className={`form-input ${formData.studentNumber ? 'filled' : ''} ${fieldErrors.studentNumber ? 'error' : ''}`}
                placeholder="Enter your student number"
                required
              />
              {fieldErrors.studentNumber && (
                <span className="error-message">{fieldErrors.studentNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`form-input ${formData.firstName ? 'filled' : ''} ${fieldErrors.firstName ? 'error' : ''}`}
                placeholder="Enter your first name"
                required
              />
              {fieldErrors.firstName && (
                <span className="error-message">{fieldErrors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`form-input ${formData.lastName ? 'filled' : ''} ${fieldErrors.lastName ? 'error' : ''}`}
                placeholder="Enter your last name"
                required
              />
              {fieldErrors.lastName && (
                <span className="error-message">{fieldErrors.lastName}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="program" className="form-label">
                Program *
              </label>
              <select
                id="program"
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                className={`form-select ${formData.program ? 'filled' : ''}`}
                required
              >
                <option value="">Select your program</option>
                {programs.map((program, index) => (
                  <option key={index} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            <div className={`form-group full-width year-level-group ${formData.program ? 'show' : ''}`}>
              <label htmlFor="yearLevel" className="form-label">
                Year Level *
              </label>
              <select
                id="yearLevel"
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleInputChange}
                className={`form-select ${formData.yearLevel ? 'filled' : ''}`}
                required
              >
                <option value="">Select your year level</option>
                {getYearLevels(formData.program).map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="confirm-button"
            disabled={isProcessing || !formData.studentNumber || !formData.lastName || 
                     !formData.firstName || !formData.program || !formData.yearLevel}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Confirm Registration'
            )}
          </button>
        </form>
      ) : (
        <div className="qr-section">
          <h3 className="qr-title">Registration Successful!</h3>
          
          <div className="qr-content-wrapper">
            <div className="qr-left-panel">
              <div className="student-info">
                <h4>Registration Details</h4>
                <p><strong>Student Number:</strong> {formData.studentNumber}</p>
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Program:</strong> {formData.program}</p>
                <p><strong>Year Level:</strong> {formData.yearLevel}</p>
              </div>

              {qrCodeUrl && (
                <div className="instructions-box">
                  <p className="instructions-title">
                    ✅ QR Code is ready for download
                  </p>
                  <p className="instructions-text">
                    <strong>Instructions:</strong> Take a screenshot or download your QR code and present it to the officers for your attendance.
                  </p>
                </div>
              )}
            </div>

            <div className="qr-canvas">
              {!qrCodeUrl ? (
                <div style={{ 
                  width: '220px', 
                  height: '220px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ textAlign: 'center', color: '#666' }}>
                    <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                    <p>Generating QR Code...</p>
                  </div>
                </div>
              ) : null}
              
              {/* Hidden canvas for QR code generation */}
              <canvas 
                ref={canvasRef}
                width="300" 
                height="300"
                style={{ display: 'none' }}
              ></canvas>
              
              {/* Visible QR code image */}
              {qrCodeUrl && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={qrCodeUrl}
                    alt="QR Code for Registration"
                    style={{ 
                      width: '220px',
                      height: '220px',
                      border: '1px solid #ddd', 
                      borderRadius: '8px',
                      display: 'block',
                      margin: '0 auto',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                      userSelect: 'none',
                      webkitUserSelect: 'none',
                      webkitTouchCallout: 'default'
                    }}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                    }}
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="qr-buttons">
            <button
              onClick={downloadQRCode}
              className="download-button"
              disabled={!qrCodeUrl}
            >
              Download QR Code
            </button>

            <button
              onClick={resetForm}
              className="confirm-button"
              style={{ background: '#6c757d', marginTop: '10px' }}
            >
              Register Another Student
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;