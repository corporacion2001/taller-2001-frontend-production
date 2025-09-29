// services/hooks/useServiceForm.js
import { useState, useCallback } from "react";

export const useServiceForm = (initialService) => {
  const [formData, setFormData] = useState({
    parts: initialService?.parts || [],
    labors: initialService?.labors || [],
    end_date: initialService?.end_date || "",
    vehicle_location: initialService?.vehicle_location || "",
    mechanics: initialService?.mechanics || [],
  });

  const [deliveryData, setDeliveryData] = useState({
    invoice_number: initialService?.invoice_number || "",
    payment_method: initialService?.payment_method || "Efectivo",
  });

  const normalizeDate = useCallback((dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDeliveryDataChange = useCallback((e) => {
    const { name, value } = e.target;
    setDeliveryData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePartChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedParts = [...prev.parts];
      updatedParts[index][field] =
        field === "amount" || field === "price"
          ? parseFloat(value) || 0
          : value;
      return { ...prev, parts: updatedParts };
    });
  }, []);

  const handleLaborChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedLabors = [...prev.labors];
      updatedLabors[index][field] =
        field === "amount" || field === "price"
          ? parseFloat(value) || 0
          : value;
      return { ...prev, labors: updatedLabors };
    });
  }, []);

  const addNewPart = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      parts: [...prev.parts, { name: "", amount: 1, price: 0 }],
    }));
  }, []);

  const addNewLabor = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      labors: [...prev.labors, { description: "", amount: 1, price: 0 }],
    }));
  }, []);

  const removePart = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  }, []);

  const removeLabor = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      labors: prev.labors.filter((_, i) => i !== index),
    }));
  }, []);

  const handleMechanicsChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      mechanics: e.target.value
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m),
    }));
  }, []);

  const calculatePartsTotal = useCallback(
    (parts = formData.parts) => {
      return parts.reduce(
        (total, part) => total + part.amount * parseFloat(part.price),
        0
      );
    },
    [formData.parts]
  );

  const calculateLaborsTotal = useCallback(
    (labors = formData.labors) => {
      return labors.reduce(
        (total, labor) => total + labor.amount * parseFloat(labor.price),
        0
      );
    },
    [formData.labors]
  );

  const hasValidParts = useCallback(() => {
    return formData.parts.some(
      (part) => part.name?.trim() && part.amount > 0 && part.price >= 0
    );
  }, [formData.parts]);

  const hasValidLabors = useCallback(() => {
    return formData.labors.some(
      (labor) =>
        labor.description?.trim() && labor.amount > 0 && labor.price >= 0
    );
  }, [formData.labors]);

  const isFormCompleteForProcess = useCallback(() => {
    return (
      formData.end_date &&
      formData.vehicle_location?.trim() &&
      formData.mechanics.length > 0 &&
      (hasValidParts() || hasValidLabors())
    );
  }, [formData, hasValidParts, hasValidLabors]);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(price || 0);
  }, []);

  return {
    formData,
    deliveryData,
    normalizeDate,
    handleInputChange,
    handleDeliveryDataChange,
    handlePartChange,
    handleLaborChange,
    handleMechanicsChange,
    addNewPart,
    addNewLabor,
    removePart,
    removeLabor,
    calculatePartsTotal,
    calculateLaborsTotal,
    hasValidParts,
    hasValidLabors,
    isFormCompleteForProcess,
    formatPrice, 
  };
};
