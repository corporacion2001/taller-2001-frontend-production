import React, { useState, useRef, useEffect } from 'react';
import styles from './camera.module.css';

const Camera = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [capturedPhotos, setCapturedPhotos] = useState([]);

  // Iniciar la cámara
  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        if (videoRef.current) {
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
          setStream(currentStream);
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        setError("No se pudo acceder a la cámara. Asegúrate de haber dado los permisos necesarios.");
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const photoUrl = canvas.toDataURL('image/jpeg');
      const photoName = `photo_${new Date().toISOString()}.jpg`;
      
      const newPhoto = {
        name: photoName,
        url: photoUrl,
        file: dataURLtoFile(photoUrl, photoName)
      };

      setCapturedPhotos(prev => [...prev, newPhoto]);
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleAccept = () => {
    if (capturedPhotos.length > 0) {
      onCapture(capturedPhotos);
    }
    onClose();
  };

  const removePhoto = (index) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.cameraContainer}>
      <div className={styles.cameraHeader}>
        <h3>Cámara</h3>
        <button onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
      </div>

      {error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <div className={styles.videoContainer}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={styles.videoElement}
            />
          </div>

          <div className={styles.cameraControls}>
            <button 
              onClick={toggleCamera} 
              className={styles.switchCameraButton}
              title="Cambiar cámara"
            >
              <span className={styles.switchIcon}>🔄</span>
            </button>

            <button 
              onClick={capturePhoto} 
              className={styles.captureButton}
              title="Tomar foto"
            >
              <div className={styles.captureButtonInner} />
            </button>
          </div>

          {capturedPhotos.length > 0 && (
            <div className={styles.previewSection}>
              <h4>Fotos tomadas ({capturedPhotos.length})</h4>
              <div className={styles.photosGrid}>
                {capturedPhotos.map((photo, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img src={photo.url} alt={`Captura ${index + 1}`} />
                    <button 
                      onClick={() => removePhoto(index)} 
                      className={styles.removePhotoButton}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.actionButtons}>
            <button 
              onClick={onClose} 
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button 
              onClick={handleAccept} 
              className={styles.acceptButton}
              disabled={capturedPhotos.length === 0}
            >
              Aceptar ({capturedPhotos.length})
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Camera;