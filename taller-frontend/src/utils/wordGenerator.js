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

  const subtotal = Number(service.total_price || 0);
  const iva = Number((subtotal * 0.13).toFixed(2));
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
        insideV: { style: BorderStyle.NONE }, // ❌ Sin líneas verticales
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
                    left: { style: BorderStyle.NONE }, // ❌ No borde vertical izquierdo
                    right: { style: BorderStyle.NONE }, // ❌ No borde vertical derecho
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
        children: [
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
            text: `Número de orden ${service.order_number}`,
            style: "header",
          }),
          new Paragraph({
            text: `Estado: ${service.status_service.name}`,
            style: "subheader",
          }),
          sectionTitle("Información General"),
          makeTable(
            [
              [
                "Fecha de ingreso:",
                `${service.entry_date} a las ${service.entry_time}`,
              ],
              ["Taller:", service.workshop.name || "No disponible"],
              [
                "Vehículo:",
                `${service.vehicle.plate} - ${service.vehicle.brand} ${service.vehicle.model}`,
              ],
              [
                "Cliente:",
                `${service.client.name} ${service.client.lastname1}`,
              ],
              ["Correo:", service.client.email || "No disponible"],
              [
                "Identificación:",
                service.client.identification || "No disponible",
              ],
              ["Teléfono:", service.client.phone || "No disponible"],
              [
                "Recibido por:",
                `${service.received_by.name} ${service.received_by.lastname1}`,
              ],
              [
                "Asignado a:",
                `${service.assigned_to.name} ${service.assigned_to.lastname1}`,
              ],
              ["Área:", service.area.name],
            ],
            [35, 65]
          ),
          sectionTitle("Repuestos"),
          service.parts?.length
            ? makeTable(
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
            : new Paragraph("No hay repuestos registrados"),
          sectionTitle("Mano de Obra"),
          service.labors?.length
            ? makeTable(
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
            : new Paragraph("No hay mano de obra registrada"),
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
              ["IVA (13%):", formatPrice(iva)],
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
                                i === 0
                                  ? AlignmentType.LEFT
                                  : AlignmentType.RIGHT,
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
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `servicio_${service.order_number}.docx`);
};
