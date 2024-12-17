import { Canvas } from "canvas";
import JsBarcode from "jsbarcode";
import PDFDocument from "pdfkit";
import { toCanvas } from "qrcode";

const BL_ID_LENGTH = 12;
const VALID_BL_ID_CHARACTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const PRINTER_DIMENSIONS = {
  label: {
    height: 271,
    width: 696,
    margin: 0,
    spaceBetween: 20,
  },
  qrcode: {
    height: 250,
    width: 250,
    scale: 6,
    margin: 0,
    paddingTop: 40,
  },
  barcode: {
    height: 0,
    width: 0,
    fontSize: 40,
    barcodeWidth: 3,
    barcodeHeight: 210,
    margin: 5,
    marginBottom: 15,
  },
};

function generateBlIds(numberOfIds: number): string[] {
  return Array.from({ length: numberOfIds }, () =>
    Array.from(
      { length: BL_ID_LENGTH },
      () =>
        VALID_BL_ID_CHARACTERS[
          Math.floor(Math.random() * VALID_BL_ID_CHARACTERS.length)
        ],
    ).join(""),
  );
}

function createBarcodeCanvas(id: string): Canvas {
  const canvas = new Canvas(
    PRINTER_DIMENSIONS.barcode.width,
    PRINTER_DIMENSIONS.barcode.height,
  );
  JsBarcode(canvas, id, {
    fontSize: PRINTER_DIMENSIONS.barcode.fontSize,
    width: PRINTER_DIMENSIONS.barcode.barcodeWidth,
    height: PRINTER_DIMENSIONS.barcode.barcodeHeight,
    margin: PRINTER_DIMENSIONS.barcode.margin,
    marginBottom: PRINTER_DIMENSIONS.barcode.marginBottom,
    text: "BL-" + id,
  });
  return canvas;
}

function createQRCodeCanvas(id: string): Canvas {
  const canvas = new Canvas(
    PRINTER_DIMENSIONS.qrcode.width,
    PRINTER_DIMENSIONS.qrcode.height,
  );
  toCanvas(
    canvas,
    id,
    {
      margin: PRINTER_DIMENSIONS.qrcode.margin,
      scale: PRINTER_DIMENSIONS.qrcode.scale,
      errorCorrectionLevel: "H",
    },
    (error) => {
      if (error) {
        throw error;
      }
    },
  );
  return canvas;
}

function createBlIdCanvas(id: string): Canvas {
  const barcodeCanvas = createBarcodeCanvas(id);
  const qrcodeCanvas = createQRCodeCanvas(id);
  const totalHeight = PRINTER_DIMENSIONS.label.height;
  const totalWidth = PRINTER_DIMENSIONS.label.width;

  const blIdCanvas = new Canvas(totalWidth, totalHeight);

  const printCtx = blIdCanvas.getContext("2d");
  printCtx.fillStyle = "white";
  printCtx.fillRect(0, 0, totalWidth, totalHeight);

  printCtx.drawImage(qrcodeCanvas, 0, PRINTER_DIMENSIONS.qrcode.paddingTop);
  printCtx.drawImage(
    barcodeCanvas,
    qrcodeCanvas.width + PRINTER_DIMENSIONS.label.spaceBetween,
    0,
  );

  return blIdCanvas;
}

async function addIdPagesToDoc(
  id: string,
  doc: PDFKit.PDFDocument,
): Promise<void> {
  const canvas = createBlIdCanvas(id);
  const pngBuffers: Buffer[] = [];
  const stream = canvas.createPNGStream();

  for await (const chunk of stream) {
    pngBuffers.push(chunk);
  }

  const pngBuffer = Buffer.concat(pngBuffers);

  for (let i = 0; i < 2; i++) {
    doc.addPage({
      size: [canvas.width, canvas.height],
    });
    doc.image(pngBuffer, 0, 0, { width: canvas.width });
  }
}

async function generateBlIdPDF(): Promise<Buffer> {
  const ids = generateBlIds(400);
  const doc = new PDFDocument({ autoFirstPage: false });

  for (const id of ids) {
    await addIdPagesToDoc(id, doc);
  }

  doc.end();

  const buffers: Buffer[] = [];

  for await (const chunk of doc) {
    buffers.push(chunk as Buffer);
  }

  return Buffer.concat(buffers);
}

export default generateBlIdPDF;
