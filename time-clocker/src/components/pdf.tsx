import { Document, Text, Page, Image, View } from "@react-pdf/renderer";

import { STYLES } from "../constants/pdf";
import type { PdfProps } from "../types/pdf";
import PANDORA from "../assets/PANDORA.png";

function fixed2(n?: number) {
    if (n == null || Number.isNaN(n)) return "0.00";
    return Number(n).toFixed(2);
}
function currency(n?: number) {
    const v = n ?? 0;
    return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Pdf({ employee, summary, reportMeta }: PdfProps) {
    const now = new Date();
    const monthLabel =
        reportMeta?.monthLabel ??
        now.toLocaleString(undefined, { month: "long", year: "numeric" });
    const generatedAt =
        reportMeta?.generatedAt ??
        now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

    return (
        <Document>
            <Page size="A4" style={STYLES.page}>
                <View style={STYLES.header}>
                    <Image style={STYLES.logo} src={PANDORA} />
                    <View style={STYLES.titleBox}>
                        <Text style={STYLES.title}>Time Clocker - Reporte de Empleado</Text>
                        <Text style={STYLES.subtitle}>Periodo: {monthLabel}</Text>
                    </View>
                </View>
                
                <Text style={STYLES.sectionTitle}>Datos del empleado</Text>
                <View style={STYLES.card}>
                    <View style={STYLES.row}>
                        <Text style={STYLES.colLabel}>Nombre completo</Text>
                        <Text style={STYLES.colValue}>{employee.full_name || "—"}</Text>
                    </View>
                    <View style={STYLES.row}>
                        <Text style={STYLES.colLabel}>Correo</Text>
                        <Text style={STYLES.colValue}>{employee.email || "—"}</Text>
                    </View>
                    <View style={STYLES.row}>
                        <Text style={STYLES.colLabel}>Documento</Text>
                        <Text style={STYLES.colValue}>{employee.document_number || "—"}</Text>
                    </View>
                    <View style={STYLES.row}>
                        <Text style={STYLES.colLabel}>Tarifa por hora</Text>
                        <Text style={STYLES.colValue}>${currency(employee.hourly_rate)}</Text>
                    </View>
                </View>

                <Text style={STYLES.sectionTitle}>Totales del mes</Text>
                <View style={STYLES.table}>
                    <View style={STYLES.tHead}>
                        <Text style={STYLES.th}>Diurna</Text>
                        <Text style={STYLES.th}>Nocturna</Text>
                        <Text style={STYLES.th}>Extra</Text>
                        <Text style={STYLES.th}>Total horas</Text>
                        <Text style={[STYLES.th, { borderRightWidth: 0 }]}>Pago</Text>
                    </View>

                    <View style={STYLES.tBodyRow}>
                        <Text style={STYLES.td}>{fixed2(summary?.hours?.diurnal)} hrs</Text>
                        <Text style={STYLES.td}>{fixed2(summary?.hours?.nocturnal)} hrs</Text>
                        <Text style={STYLES.td}>{fixed2(summary?.hours?.extra)} hrs</Text>
                        <Text style={STYLES.td}>{fixed2(summary?.hours?.total)} hrs</Text>
                        <Text style={[STYLES.td, STYLES.tdRight, { borderRightWidth: 0 }]}>
                            ${currency(summary?.pay_total)}
                        </Text>
                    </View>
                </View>

                <Text style={STYLES.sectionTitle}>Observaciones</Text>
                <View style={[STYLES.card, { minHeight: 80 }]} />

                <View style={STYLES.signatures}>
                    <View style={STYLES.signBox}>
                        <View style={STYLES.signLine} />
                        <Text style={STYLES.signLabel}>Firma del Administrador</Text>
                    </View>
                    <View style={STYLES.signBox}>
                        <View style={STYLES.signLine} />
                        <Text style={STYLES.signLabel}>Firma del Empleado</Text>
                    </View>
                </View>

                <View style={STYLES.footer}>
                    <Text>Generado: {generatedAt}</Text>
                    <Text>Pandora Restaurante · JDT Software</Text>
                </View>
            </Page>
        </Document>
    );
}
