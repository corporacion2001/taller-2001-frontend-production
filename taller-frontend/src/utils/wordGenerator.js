import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

export const generateServiceWord = async (service) => {
  const formatPrice = (amount) =>
    `CRC ${Number(amount || 0).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
    })}`;

  const ivaRate = Number(service.iva) / 100 ; 
  const subtotal = Number(service.total_price || 0);
  const iva = Number((subtotal * ivaRate).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  const blueColor = "1532ba";
  const greenColor = "008000";

  const sectionTitle = (text) =>
    new Paragraph({
      text,
      spacing: { before: 200, after: 100 },
      style: "sectionHeader",
    });

  const makeTable = (rows, widths, alignRight = false) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideH: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
        insideV: { style: BorderStyle.NONE },
      },
      rows: rows.map(
        (r, rowIndex) =>
          new TableRow({
            children: r.map(
              (c, i) =>
                new TableCell({
                  width: widths
                    ? { size: widths[i], type: WidthType.PERCENTAGE }
                    : undefined,
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({
                      text: c,
                      spacing: { before: 100, after: 100 },
                      alignment:
                        rowIndex === 0
                          ? AlignmentType.LEFT
                          : alignRight
                          ? AlignmentType.RIGHT
                          : AlignmentType.LEFT,
                      run: {
                        bold: rowIndex === 0,
                      },
                    }),
                  ],
                })
            ),
          })
      ),
    });

  // Construir el array de children dinámicamente
  const documentChildren = [
    new Paragraph({
      children: [
        new TextRun({
          text: "[Inserte acá el logo]",
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Número de orden: ${service.order_number}` || "No disponible",
      style: "header",
    }),
    new Paragraph({
      text: `Estado: ${service.status_service.name}` || "No disponible",
      style: "subheader",
    }),
    sectionTitle("Información General"),
    makeTable(
      [
        [
          "Fecha de ingreso:",
          `${service.entry_date} a las ${service.entry_time}` ||
            "No disponible",
        ],
        [
          "Nombre del cliente:",
          `${service.client.name || ""} ${service.client.lastname1 || ""} ${
            service.client.lastname2 || ""
          }`.trim() || "No disponible",
        ],
        ["Marca:", service.vehicle.brand || "No disponible"],
        ["Placa:", service.vehicle.plate || "No disponible"],
        [
          "Kilometraje:",
          service.vehicle.mileage
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
          `${service.received_by.name} ${service.received_by.lastname1}` ||
            "No disponible",
        ],
      ],
      [35, 65]
    ),
  ];

  // Agregar observaciones solo si existen y no están vacías
  if (service.observations && service.observations.trim() !== "") {
    documentChildren.push(
      sectionTitle("Observaciones"),
      new Paragraph({
        text: service.observations,
        spacing: { before: 100, after: 200 },
        border: {
          bottom: {
            color: "dee2e6",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
  }

  if (service.parts && service.parts.length > 0) {
    documentChildren.push(
      sectionTitle("Repuestos"),
      makeTable(
        [
          ["Nombre", "Cantidad", "Precio Unitario", "Total"],
          ...service.parts.map((part) => [
            part.name || "No especificado",
            part.amount.toString(),
            formatPrice(part.price),
            formatPrice(part.amount * part.price),
          ]),
        ],
        [40, 20, 20, 20]
      )
    );
  }

  // Agregar mano de obra solo si existe
  if (service.labors && service.labors.length > 0) {
    documentChildren.push(
      sectionTitle("Mano de Obra"),
      makeTable(
        [
          ["Descripción", "Cantidad", "Precio Unitario", "Total"],
          ...service.labors.map((labor) => [
            labor.description || "No especificado",
            labor.amount.toString(),
            formatPrice(labor.price),
            formatPrice(labor.amount * labor.price),
          ]),
        ],
        [40, 20, 20, 20]
      )
    );
  }

  // Agregar detalles financieros (siempre se muestran)
  documentChildren.push(
    sectionTitle("Detalles Financieros"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideH: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
        insideV: { style: BorderStyle.NONE },
      },
      rows: [
        ["N° Factura:", service.invoice_number || "No especificado"],
        ["Método de pago:", service.payment_method || "No especificado"],
        ["Subtotal:", formatPrice(subtotal)],
        // Cambiado: Usar el IVA dinámico del servicio
        [`IVA (${Math.round(service.iva)}%):`, formatPrice(iva)],
      ]
        .map(
          (r) =>
            new TableRow({
              children: r.map(
                (c, i) =>
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        text: c,
                        alignment:
                          i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
                        spacing: { before: 100, after: 100 },
                      }),
                    ],
                  })
              ),
            })
        )
        .concat([
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    text: "Total:",
                    alignment: AlignmentType.LEFT,
                    spacing: { before: 100, after: 100 },
                    run: { bold: true },
                  }),
                ],
              }),
              new TableCell({
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: formatPrice(total),
                        bold: true,
                        color: greenColor,
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 100, after: 100 },
                  }),
                ],
              }),
            ],
          }),
        ]),
    })
  );

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "header",
          name: "Header",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, color: blueColor, size: 32 },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          },
        },
        {
          id: "subheader",
          name: "Subheader",
          basedOn: "Normal",
          run: { size: 24 },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          },
        },
        {
          id: "sectionHeader",
          name: "Section Header",
          basedOn: "Normal",
          run: { bold: true, size: 28 },
          paragraph: { spacing: { before: 200, after: 200 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children: documentChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `servicio_${service.order_number}.docx`);
};