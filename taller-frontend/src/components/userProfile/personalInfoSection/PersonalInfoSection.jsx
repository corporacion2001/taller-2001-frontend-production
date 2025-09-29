import React from "react";
import { FiUser } from "react-icons/fi";
import { SectionCard } from "../../ui/sectionCard/SectionCard";
import { FormRow } from "../../ui/formRow/FormRow";
import FormField from "../formField/FormField";

const PersonalInfoSection = ({
  user,
  isEditing,
  formData,
  errors,
  onInputChange,
}) => {
  return (
    <SectionCard title="Información Personal" icon={FiUser}>
      <FormRow>
        <FormField
          label="Nombre"
          name="name"
          value={isEditing ? formData.name : user?.name}
          error={errors.name}
          editing={isEditing}
          onChange={onInputChange}
          required
          placeholder="Ej: Juan Carlos"
          minLength={3}
          maxLength={75}
        />
        <FormField
          label="Primer Apellido"
          name="lastname1"
          value={isEditing ? formData.lastname1 : user?.lastname1}
          error={errors.lastname1}
          editing={isEditing}
          onChange={onInputChange}
          required
          placeholder="Ej: González"
          maxLength={75}
          minLength={3}
        />
        <FormField
          label="Segundo Apellido"
          name="lastname2"
          value={isEditing ? formData.lastname2 : user?.lastname2}
          error={errors.lastname2}
          editing={isEditing}
          onChange={onInputChange}
          placeholder="Ej: Rodríguez (opcional)"
          maxLength={75}
        />
      </FormRow>
    </SectionCard>
  );
};

export default PersonalInfoSection;
