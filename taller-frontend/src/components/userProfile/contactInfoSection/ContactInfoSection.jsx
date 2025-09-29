import React from "react";
import { FiMail } from "react-icons/fi";
import { SectionCard } from "../../ui/sectionCard/SectionCard";
import { FormRow } from "../../ui/formRow/FormRow";
import FormField from "../formField/FormField";

const ContactInfoSection = ({
  user,
  isEditing,
  formData,
  errors,
  onInputChange,
  isAdmin,
}) => {
  // Función para formatear teléfono
  const formatPhone = (phone) => {
    if (!phone) return "";
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}`;
  };

  // Manejador especial para teléfono
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    onInputChange({
      target: {
        name: "phone",
        value: rawValue,
      },
    });
  };

  return (
    <SectionCard title="Información de Contacto" icon={FiMail}>
      <FormRow>
        <FormField
          label="Correo Electrónico"
          name="email"
          type="email"
          value={isEditing ? formData.email || "" : user?.email || ""}
          error={errors.email}
          editing={isEditing && isAdmin}
          onChange={onInputChange}
          disabled={!isAdmin}
          required={isAdmin}
          placeholder="Ej: usuario@empresa.com"
          maxLength={100}
        />

        <FormField
          label="Teléfono"
          name="phone"
          type="tel"
          value={
            isEditing ? formatPhone(formData.phone) : formatPhone(user?.phone)
          }
          error={errors.phone}
          editing={isEditing && isAdmin}
          onChange={handlePhoneChange}
          disabled={!isAdmin}
          required={isAdmin}
          placeholder="Ej: 8888-9999"
          maxLength={9}
        />
      </FormRow>

      <FormRow>
        <FormField
          label="Dirección"
          name="address"
          value={isEditing ? formData.address || "" : user?.address || ""}
          error={errors.address}
          editing={isEditing}
          onChange={onInputChange}
          placeholder="Ej: Calle 123, Ciudad, Provincia"
          maxLength={255}
        />
      </FormRow>
    </SectionCard>
  );
};

export default ContactInfoSection;
