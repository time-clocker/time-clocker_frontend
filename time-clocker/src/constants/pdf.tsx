import {  StyleSheet } from "@react-pdf/renderer";

export const STYLES = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: "#111" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logo: { width: 200, height: 0, objectFit: "contain" },
  titleBox: { textAlign: "right" },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { marginTop: 2, fontSize: 10, color: "#555" },

  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 18, marginBottom: 8, color: "#0b6b3a" },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 6, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 6 },
  colLabel: { width: 150, color: "#555" },
  colValue: { flex: 1, fontWeight: 500 },

  table: { marginTop: 6, borderWidth: 1, borderColor: "#ddd", borderRadius: 6, overflow: "hidden" },
  tHead: { flexDirection: "row", backgroundColor: "#f3f7ff" },
  tBodyRow: { flexDirection: "row" },
  th: { flex: 1, padding: 8, fontSize: 10, fontWeight: 700, color: "#105e36", borderRightWidth: 1, borderRightColor: "#e6e6e6" },
  td: { flex: 1, padding: 8, fontSize: 10, borderRightWidth: 1, borderRightColor: "#f0f0f0" },
  tdRight: { textAlign: "right" },

  signatures: { position: "absolute", bottom: 80, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between" },
  signBox: { width: "45%", alignItems: "center" },
  signLine: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#000", width: "100%" },
  signLabel: { marginTop: 4, fontSize: 10, color: "#333", textAlign: "center" },

  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 9, color: "#666", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
});