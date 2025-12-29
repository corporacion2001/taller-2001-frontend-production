import * as XLSX from "xlsx-js-style";

export const generateServiceExcel = (service) => {
  const formatPrice = (amount) =>
    `CRC ${Number(amount || 0).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
    })}`;

  const subtotal = Number(service.total_price || 0);
  const iva = Number((subtotal * 0.13).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  // ==================== ESTILOS PROFESIONALES ====================
  const logoPlaceholderStyle = {
    font: { bold: true, sz: 11, color: { rgb: "6c757d" }, italic: true },
    fill: { fgColor: { rgb: "f8f9fa" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "dee2e6" } },
      bottom: { style: "thin", color: { rgb: "dee2e6" } },
      left: { style: "thin", color: { rgb: "dee2e6" } },
      right: { style: "thin", color: { rgb: "dee2e6" } },
    },
  };

  const titleStyle = {
    font: { bold: true, sz: 14, color: { rgb: "1532ba" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      bottom: { style: "medium", color: { rgb: "1532ba" } },
    },
  };

  const sectionHeaderStyle = {
    font: { bold: true, sz: 11, color: { rgb: "2c3e50" } },
    fill: { fgColor: { rgb: "e8eef5" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      bottom: { style: "thin", color: { rgb: "dee2e6" } },
    },
  };

  const labelStyle = {
    font: { bold: true, sz: 10, color: { rgb: "495057" } },
    fill: { fgColor: { rgb: "f8f9fa" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      right: { style: "thin", color: { rgb: "dee2e6" } },
      bottom: { style: "hair", color: { rgb: "e9ecef" } },
    },
  };

  const valueStyle = {
    font: { sz: 10, color: { rgb: "212529" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      bottom: { style: "hair", color: { rgb: "e9ecef" } },
    },
  };

  const tableHeaderStyle = {
    font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "495057" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "495057" } },
      bottom: { style: "thin", color: { rgb: "495057" } },
      left: { style: "thin", color: { rgb: "495057" } },
      right: { style: "thin", color: { rgb: "495057" } },
    },
  };

  const tableCellStyle = {
    font: { sz: 10 },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "hair", color: { rgb: "dee2e6" } },
      bottom: { style: "hair", color: { rgb: "dee2e6" } },
      left: { style: "hair", color: { rgb: "dee2e6" } },
      right: { style: "hair", color: { rgb: "dee2e6" } },
    },
  };

  const totalLabelStyle = {
    font: { bold: true, sz: 11, color: { rgb: "2c3e50" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "dee2e6" } },
    },
  };

  const totalValueStyle = {
    font: { bold: true, sz: 11, color: { rgb: "2f9e44" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "2f9e44" } },
      bottom: { style: "medium", color: { rgb: "2f9e44" } },
    },
  };

  // ==================== CREAR HOJA ====================
  const ws = XLSX.utils.aoa_to_sheet([]);
  let currentRow = 0;

  // ==================== ESPACIO PARA LOGO ====================
  XLSX.utils.sheet_add_aoa(ws, [["[Inserte aquí el logo]"]], {
    origin: { r: currentRow, c: 0 },
  });
  ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = logoPlaceholderStyle;
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 3 },
  });
  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][currentRow] = { hpt: 60 }; // Altura de 60 puntos para el logo
  currentRow += 2;

  // ==================== TÍTULO ====================
  XLSX.utils.sheet_add_aoa(
    ws,
    [[`Número de orden: ${service.order_number || "No disponible"}`]],
    {
      origin: { r: currentRow, c: 0 },
    }
  );
  ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = titleStyle;
  ws["!merges"].push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 3 },
  });
  currentRow += 1;

  // Estado
  XLSX.utils.sheet_add_aoa(
    ws,
    [[`Estado: ${service.status_service?.name || "No disponible"}`]],
    {
      origin: { r: currentRow, c: 0 },
    }
  );
  ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = {
    font: { sz: 11, color: { rgb: "495057" } },
    alignment: { horizontal: "center", vertical: "center" },
  };
  ws["!merges"].push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 3 },
  });
  currentRow += 2;

  // ==================== INFORMACIÓN GENERAL ====================
  XLSX.utils.sheet_add_aoa(ws, [["Información General"]], {
    origin: { r: currentRow, c: 0 },
  });
  ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = sectionHeaderStyle;
  ws["!merges"].push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 3 },
  });
  currentRow += 1;

  const generalInfo = [
    [
      "Fecha de ingreso:",
      `${service.entry_date} a las ${service.entry_time}` || "No disponible",
    ],
    [
      "Nombre del cliente:",
      `${service.client?.name || ""} ${service.client?.lastname1 || ""} ${
        service.client?.lastname2 || ""
      }`.trim() || "No disponible",
    ],
    ["Marca:", service.vehicle?.brand || "No disponible"],
    ["Placa:", service.vehicle?.plate || "No disponible"],
    [
      "Kilometraje:",
      service.vehicle?.mileage
        ? `${Number(service.vehicle.mileage).toLocaleString("es-CR")} km`
        : "No disponible",
    ],
    [
      "Encargado de flotilla:",
      service.fleetUser
        ? `${service.fleetUser.name} ${service.fleetUser.lastname1}`.trim()
        : "No disponible",
    ],
    [
      "Encargado de taller:",
      service.assigned_to
        ? `${service.assigned_to.name} ${service.assigned_to.lastname1}`.trim()
        : "No disponible",
    ],
    [
      "Mecánico:",
      service.mechanics && service.mechanics.length > 0
        ? service.mechanics.join(", ")
        : "No disponible",
    ],
    [
      "Recibido por:",
      `${service.received_by?.name || ""} ${
        service.received_by?.lastname1 || ""
      }`.trim() || "No disponible",
    ],
  ];

  generalInfo.forEach((row) => {
    XLSX.utils.sheet_add_aoa(ws, [[row[0], row[1]]], {
      origin: { r: currentRow, c: 0 },
    });
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = labelStyle;
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 1 })].s = valueStyle;
    ws["!merges"].push({
      s: { r: currentRow, c: 1 },
      e: { r: currentRow, c: 3 },
    });
    currentRow++;
  });
  currentRow += 1;

  // ==================== OBSERVACIONES ====================
  if (service.observations && service.observations.trim() !== "") {
    XLSX.utils.sheet_add_aoa(ws, [["Observaciones"]], {
      origin: { r: currentRow, c: 0 },
    });
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = sectionHeaderStyle;
    ws["!merges"].push({
      s: { r: currentRow, c: 0 },
      e: { r: currentRow, c: 3 },
    });
    currentRow += 1;

    XLSX.utils.sheet_add_aoa(ws, [[service.observations]], {
      origin: { r: currentRow, c: 0 },
    });
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = {
      font: { sz: 10 },
      fill: { fgColor: { rgb: "fffacd" } },
      alignment: { horizontal: "left", vertical: "top", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "dee2e6" } },
        bottom: { style: "thin", color: { rgb: "dee2e6" } },
        left: { style: "thin", color: { rgb: "dee2e6" } },
        right: { style: "thin", color: { rgb: "dee2e6" } },
      },
    };
    ws["!merges"].push({
      s: { r: currentRow, c: 0 },
      e: { r: currentRow, c: 3 },
    });
    ws["!rows"][currentRow] = { hpt: 50 };
    currentRow += 2;
  }

  // ==================== REPUESTOS ====================
  if (service.parts && service.parts.length > 0) {
    XLSX.utils.sheet_add_aoa(ws, [["Repuestos"]], {
      origin: { r: currentRow, c: 0 },
    });
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = sectionHeaderStyle;
    ws["!merges"].push({
      s: { r: currentRow, c: 0 },
      e: { r: currentRow, c: 3 },
    });
    currentRow += 1;

    const partsHeaders = ["Nombre", "Cantidad", "Precio Unitario", "Total"];
    XLSX.utils.sheet_add_aoa(ws, [partsHeaders], {
      origin: { r: currentRow, c: 0 },
    });
    partsHeaders.forEach((_, idx) => {
      ws[XLSX.utils.encode_cell({ r: currentRow, c: idx })].s =
        tableHeaderStyle;
    });
    currentRow++;

    service.parts.forEach((part) => {
      const row = [
        part.name || "No especificado",
        part.amount,
        formatPrice(part.price),
        formatPrice(part.amount * part.price),
      ];

      XLSX.utils.sheet_add_aoa(ws, [row], {
        origin: { r: currentRow, c: 0 },
      });

      ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = tableCellStyle;
      ws[XLSX.utils.encode_cell({ r: currentRow, c: 1 })].s = {
        ...tableCellStyle,
        alignment: { horizontal: "center", vertical: "center" },
      };
      ws[XLSX.utils.encode_cell({ r: currentRow, c: 2 })].s = {
        ...tableCellStyle,
        alignment: { horizontal: "right", vertical: "center" },
      };
      ws[XLSX.utils.encode_cell({ r: currentRow, c: 3 })].s = {
        ...tableCellStyle,
        alignment: { horizontal: "right", vertical: "center" },
      };

      currentRow++;
    });
    currentRow += 1;
  }

  // ==================== MANO DE OBRA ====================
  if (service.labors && service.labors.length > 0) {
    XLSX.utils.sheet_add_aoa(ws, [["Mano de Obra"]], {
      origin: { r: currentRow, c: 0 },
    });
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = sectionHeaderStyle;
    ws["!merges"].push({
      s: { r: currentRow, c: 0 },
      e: { r: currentRow, c: 3 },
    });
    currentRow += 1;

    const laborsHeaders = [
      "Descripción",
      "Cantidad",
      "Precio Unitario",
      "Total",
    ];
    XLSX.utils.sheet_add_aoa(ws, [laborsHeaders], {
      origin: { r: currentRow, c: 0 },
    });
    laborsHeaders.forEach((_, idx) => {
      ws[XLSX.utils.encode_cell({ r: currentRow, c: idx })].s =
        tableHeaderStyle;
    });
    currentRow++;

    service.labors.forEach((labor) => {
      const row = [
        labor.description || "No especificado",
        labor.amount,
        formatPrice(labor.price),
        formatPrice(labor.amount * labor.price),
      ];

      XLSX.utils.sheet_add_aoa(ws, [row], {
        origin: { r: currentRow, c: 0 },
      });

      ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = tableCellStyle;
      ws[XLSX.utils.encode_cell({ r: currentRow, c: 1 })].s = {
        ...tableCellStyle,
        alignment: { horizontal: "center", vertical: "center" },
      };
      ws[XLSX.utils.encode_cell({ r: currentRow, c: 2 })].s = {
        ...tableCellStyle,
        alignment: { horizontal: "right", vertical: "center" },
      };
      ws[XLSX.utils.encode_cell({ r: currentRow, c: 3 })].s = {
        ...tableCellStyle,
        alignment: { horizontal: "right", vertical: "center" },
      };

      currentRow++;
    });
    currentRow += 1;
  }

  // ==================== DETALLES FINANCIEROS ====================
  XLSX.utils.sheet_add_aoa(ws, [["Detalles Financieros"]], {
    origin: { r: currentRow, c: 0 },
  });
  ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = sectionHeaderStyle;
  ws["!merges"].push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 3 },
  });
  currentRow += 1;

  const financialInfo = [
    ["N° Factura:", service.invoice_number || "No especificado"],
    ["Método de pago:", service.payment_method || "No especificado"],
  ];

  financialInfo.forEach((row) => {
    XLSX.utils.sheet_add_aoa(ws, [[row[0], row[1]]], {
      origin: { r: currentRow, c: 0 },
    });
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 0 })].s = labelStyle;
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 1 })].s = valueStyle;
    ws["!merges"].push({
      s: { r: currentRow, c: 1 },
      e: { r: currentRow, c: 3 },
    });
    currentRow++;
  });

  currentRow += 1;

  // Totales
  const totalsData = [
    ["", "", "Subtotal:", formatPrice(subtotal)],
    ["", "", "IVA (13%):", formatPrice(iva)],
    ["", "", "Total:", formatPrice(total)],
  ];

  totalsData.forEach((row, idx) => {
    XLSX.utils.sheet_add_aoa(ws, [row], {
      origin: { r: currentRow, c: 0 },
    });

    ws[XLSX.utils.encode_cell({ r: currentRow, c: 2 })].s =
      idx === 2
        ? {
            ...totalLabelStyle,
            font: { bold: true, sz: 12, color: { rgb: "2c3e50" } },
          }
        : totalLabelStyle;
    ws[XLSX.utils.encode_cell({ r: currentRow, c: 3 })].s =
      idx === 2
        ? totalValueStyle
        : {
            ...valueStyle,
            alignment: { horizontal: "right", vertical: "center" },
          };

    currentRow++;
  });

  // ==================== ANCHOS DE COLUMNA ====================
  ws["!cols"] = [{ wch: 22 }, { wch: 45 }, { wch: 18 }, { wch: 18 }];

  // ==================== CREAR LIBRO ====================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orden de Servicio");

  XLSX.writeFile(wb, `servicio_${service.order_number}.xlsx`);
};