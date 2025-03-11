import PDFDocument from "pdfkit-table";
import { prestamoService } from "../services/prestamo.service.js";
import { pool } from "../config/db.js";

export const generarReportePrestamos = async (req, res) => {
  try {
    const prestamos = await prestamoService.getAllForReport();

    console.log(prestamos);

    // Configurar PDF
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const filename = `Reporte_Prestamos_${Date.now()}.pdf`;

    // Configurar headers de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe el PDF directamente a la respuesta
    doc.pipe(res);

    // Título del documento
    doc.fontSize(20).text("Reporte de Préstamos", { align: "center" });
    doc.moveDown();

    // Fecha de generación
    doc.fontSize(12).text(`Generado el: ${new Date().toLocaleDateString()}`, {
      align: "right",
    });
    doc.moveDown();

    // Configurar tabla
    const table = {
      title: "Listado de Préstamos",
      headers: [
        { label: "ID", property: "id", width: 100 },
        { label: "Usuario", property: "usuario", width: 150 },
        { label: "Libro", property: "libro", width: 150 },
        { label: "Fecha Préstamo", property: "fechaPrestamo", width: 100 },
        { label: "Fecha Devolución", property: "fechaDevolucion", width: 100 },
      ],
      datas: prestamos.map((p) => ({
        id: p.id.substring(0, 37),
        usuario: p.usuario_nombre,
        libro: p.libro_titulo,
        fechaPrestamo: new Date(p.fechaprestamo).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        fechaDevolucion: p.fechadevolucion
          ? new Date(p.fechadevolucion).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Pendiente",
      })),
    };

    // Dibujar tabla
    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold"),
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font("Helvetica").fontSize(10);
        indexColumn === 0 &&
          doc.addBackground(rectRow, indexRow % 2 ? "#F5F5F5" : "white");
      },
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generarReportePrestamosUsuario = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Obtener historial de préstamos del usuario
    const { rows: historial } = await pool.query(
      `SELECT 
        hp.fechaprestamo,
        hp.fechadevolucion,
        l.titulo,
        l.autor,
        l.imagen_url
       FROM HistorialPrestamo hp
       JOIN Libro l ON hp.libroid = l.id
       WHERE hp.usuarioid = $1
       ORDER BY hp.fechaprestamo DESC`,
      [userId]
    );

    console.log(historial)

    // Configurar PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const filename = `Historial_Prestamos_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text('Mi Historial de Préstamos', { align: 'center' });
    doc.moveDown(0.5);
    
    // Información del usuario
    doc.fontSize(12)
      .text(`Usuario: ${req.user.nombre} (${req.user.email})`)
      .moveDown(1);

    // Tabla de préstamos
    const table = {
      title: 'Detalle de Préstamos',
      headers: [
        { label: 'Libro', property: 'titulo', width: 150 },
        { label: 'Autor', property: 'autor', width: 120 },
        { label: 'Fecha Préstamo', property: 'fechaPrestamo', width: 100 },
        { label: 'Fecha Devolución', property: 'fechaDevolucion', width: 100 },
        { label: 'Estado', property: 'estado', width: 80 }
      ],
      datas: historial.map(h => ({
        titulo: h.titulo,
        autor: h.autor,
        fechaPrestamo: new Date(h.fechaprestamo).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        fechaDevolucion: h.fechadevolucion 
          ? new Date(h.fechadevolucion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          : 'Pendiente',
        estado: h.fechadevolucion ? 'Pendiente' : 'Activo'
      }))
    };

    // Dibujar tabla
    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font('Helvetica').fontSize(10);
        indexColumn === 0 && doc.addBackground(rectRow, indexRow % 2 ? '#F5F5F5' : 'white');
      }
    });

    doc.end();

  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ message: 'Error generando el reporte' });
  }
};