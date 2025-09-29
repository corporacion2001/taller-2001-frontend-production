import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "./profileHeader/ProfileHeader";
import ProfileStatus from "./profileStatus/ProfileStatus";
import PersonalInfoSection from "./personalInfoSection/PersonalInfoSection";
import ContactInfoSection from "./contactInfoSection/ContactInfoSection";
import ProfileAvatar from "./profileAvatar/ProfileAtavar";
import AdditionalInfoSection from "./additionalInfoSection/AdditionalInfoSection";
import styles from "./userProfile.module.css";
import UploadPhotoModal from "../ui/uploadPhotoModal/UploadPhotoModal";
import { useNotification } from "../../contexts/NotificationContext"; // Importa el contexto

// Campos editables según rol
const COMMON_FIELDS = ["name", "lastname1", "lastname2", "address"];
const ADMIN_FIELDS = ["phone", "email", "identification", "start_date"];

const UserProfile = () => {
  const { user, updateProfile, loadUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { showSuccess, showError, showInfo } = useNotification();

  const isAdmin = user?.roles?.includes("Administrador");

  const [formData, setFormData] = useState(() => {
    const initialData = {};
    const allowedFields = isAdmin
      ? [...COMMON_FIELDS, ...ADMIN_FIELDS]
      : COMMON_FIELDS;

    allowedFields.forEach((field) => {
      initialData[field] = user?.[field] || "";
    });

    return initialData;
  });

  const validateRequiredFields = () => {
    const newErrors = {};

    // Requisitos comunes
    if (!formData.name?.trim()) {
      newErrors.name = "Nombre es obligatorio";
    }

    if (!formData.lastname1?.trim()) {
      newErrors.lastname1 = "Primer apellido es obligatorio";
    }

    // Segundo apellido NO es obligatorio, no se valida

    if (!formData.address?.trim()) {
      newErrors.address = "Dirección es obligatoria";
    }

    if (isAdmin) {
      if (!formData.email?.trim()) {
        newErrors.email = "Correo electrónico es obligatorio";
      } else if (
        !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email.trim())
      ) {
        newErrors.email = "Correo electrónico no es válido";
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = "Teléfono es obligatorio";
      } else if (!/^\d{8}$/.test(formData.phone)) {
        newErrors.phone = "El teléfono debe tener 8 dígitos";
      }

      if (!formData.identification?.trim()) {
        newErrors.identification = "La cédula es obligatoria";
      } else if (
        formData.identification.length < 9 ||
        formData.identification.length > 12
      ) {
        newErrors.identification = "La cédula debe tener entre 9 y 12 dígitos";
      }

      if (!formData.start_date?.trim()) {
        newErrors.start_date = "La fecha de inicio es obligatoria";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateRequiredFields()) {
      return;
    }

    const changedData = {};
    const allowedFields = isAdmin
      ? [...COMMON_FIELDS, ...ADMIN_FIELDS]
      : COMMON_FIELDS;

    allowedFields.forEach((field) => {
      if (formData[field] !== user?.[field]) {
        changedData[field] = formData[field];
      }
    });

    if (Object.keys(changedData).length === 0) {
      showInfo("No hay cambios válidos para guardar");
      return;
    }

    setLoading(true);

    try {
      await updateProfile(changedData);
      showSuccess("Perfil actualizado correctamente");
      await loadUser();

      setIsEditing(false);
    } catch (error) {
      if (error.response?.data?.errorCode === "DUPLICATE_EMAIL") {
        setErrors({ email: "Este correo ya está registrado" });
      } else {
        showError("Ocurrió un error al actualizar");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    const resetData = {};
    const allowedFields = isAdmin
      ? [...COMMON_FIELDS, ...ADMIN_FIELDS]
      : COMMON_FIELDS;

    allowedFields.forEach((field) => {
      resetData[field] = user?.[field] || "";
    });

    setFormData(resetData);
    setErrors({});
  };

  return (
    <div className={styles.profileContainer}>
      <ProfileHeader
        isEditing={isEditing}
        loading={loading}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSubmit}
        onBack={() => navigate("/dashboard")}
      />
      <ProfileStatus status={user?.status} start_date={user?.start_date} />
      <ProfileAvatar onEdit={() => setShowUploadModal(true)} />

      {showUploadModal && (
        <UploadPhotoModal onClose={() => setShowUploadModal(false)} />
      )}
      {/* Bien escrito */}
      {/* Aquí el avatar */}
      <div className={styles.profileGrid}>
        <div className={styles.profileColumn}>
          <PersonalInfoSection
            user={user}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            isAdmin={isAdmin}
          />
        </div>

        <div className={styles.profileColumn}>
          <ContactInfoSection
            user={user}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            isAdmin={isAdmin}
          />
          <AdditionalInfoSection
            user={user}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
