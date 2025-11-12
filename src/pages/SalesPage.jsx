// src/pages/SalesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Tooltip,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs from "dayjs";
import api from "../api/axiosClient";

// Opciones fijas (ajústalas si tu BE usa otros valores exactos)
const CHANNELS = ["Tienda", "WhatsApp", "Instagram", "Web"];
const PAYMENT_METHODS = ["Efectivo", "Nequi", "Bancolombia", "Tarjeta"];
const TRANSACTION_TYPES = ["Venta", "Alquiler"];

export default function SalesPage() {
  // Catálogos
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Venta
  const [saleDate, setSaleDate] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [channel, setChannel] = useState("Tienda");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [transactionType, setTransactionType] = useState("Venta");
  const [returnDate, setReturnDate] = useState(""); // solo para alquiler
  const [remisionVenta, setRemisionVenta] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Items multi-producto
  const [items, setItems] = useState([
    { product: null, qty: 1, price: 0, lineTotal: 0 },
  ]);

  // Historial
  const [sales, setSales] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // UI
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const notify = (msg, sev = "success") => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Crear cliente
  const [openCreateCustomer, setOpenCreateCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    documentId: "",
    phone: "",
    email: "",
    city: "",
    address: "",
  });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  // Carga inicial
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pRes, cRes, sRes] = await Promise.all([
          api.get("/products"),
          api.get("/customers", { params: { q: "" } }),
          api.get("/sales"),
        ]);
        setProducts(pRes.data || []);
        setCustomers(cRes.data || []);
        setSales(Array.isArray(sRes.data) ? sRes.data : []);
      } catch (e) {
        console.error(e);
        notify("Error cargando datos iniciales", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Buscar clientes por texto
  const searchCustomers = async (q) => {
    try {
      const res = await api.get("/customers", { params: { q } });
      setCustomers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Total de la venta
  const totalVenta = useMemo(
    () => items.reduce((acc, it) => acc + (it.lineTotal || 0), 0),
    [items]
  );

  // Handlers de items
  const updateItem = (idx, patch) => {
    setItems((prev) => {
      const next = [...prev];
      const cur = { ...next[idx], ...patch };
      const qty = Number(cur.qty) > 0 ? Number(cur.qty) : 0;
      const price = Number(cur.price) >= 0 ? Number(cur.price) : 0;
      cur.lineTotal = +(qty * price).toFixed(2);
      next[idx] = cur;
      return next;
    });
  };

  const handleSelectProduct = (idx, product) => {
    if (!product) {
      updateItem(idx, { product: null, price: 0, qty: 1 });
      return;
    }
    const price = Number(product.price ?? 0);
    updateItem(idx, { product, price, qty: 1 });
  };

  const addItem = () =>
    setItems((prev) => [...prev, { product: null, qty: 1, price: 0, lineTotal: 0 }]);

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  // Guardar venta
  const submit = async () => {
    try {
      if (!selectedCustomer?.customerId) {
        notify("Selecciona un cliente", "warning");
        return;
      }
      if (!remisionVenta?.trim()) {
        notify("La remisión es obligatoria", "warning");
        return;
      }
      const lines = items
        .filter((it) => it.product && it.qty > 0)
        .map((it) => ({
          productId: it.product.productId,
          unitQty: Number(it.qty),
          unitPrice: Number(it.price),
        }));
      if (!lines.length) {
        notify("Agrega al menos un producto", "warning");
        return;
      }

      const payload = {
        saleDate: dayjs(saleDate).isValid()
          ? dayjs(saleDate).toISOString()
          : dayjs().toISOString(),
        remisionVenta: remisionVenta.trim(),
        transactionType,
        productId: lines[0].productId, // compat con BE
        channel,
        unitQty: lines[0].unitQty,
        saleValue: totalVenta,
        paymentMethod,
        customerId: selectedCustomer.customerId,
        items: lines, // si el BE ya soporta multi-línea
        returnDate: transactionType === "Alquiler" ? returnDate : null,
      };

      await api.post("/sales", payload);
      notify("Venta guardada");
      loadSales();
      setRemisionVenta("");
      setItems([{ product: null, qty: 1, price: 0, lineTotal: 0 }]);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 409) {
        notify("Ya existe una venta con esa remisión", "error");
      } else {
        notify("Error guardando la venta", "error");
      }
    }
  };

  // Cargar historial
  const loadSales = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get("/sales");
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      notify("Error cargando historial", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Crear cliente
  const openNewCustomer = () => {
    setNewCustomer({
      firstName: "",
      lastName: "",
      documentId: "",
      phone: "",
      email: "",
      city: "",
      address: "",
    });
    setOpenCreateCustomer(true);
  };
  const closeNewCustomer = () => setOpenCreateCustomer(false);

  const submitCreateCustomer = async () => {
    if (!newCustomer.firstName?.trim()) {
      notify("El nombre es obligatorio", "warning");
      return;
    }
    if (!newCustomer.email?.trim() && !newCustomer.documentId?.trim()) {
      notify("Email o Documento: al menos uno es obligatorio", "warning");
      return;
    }

    setCreatingCustomer(true);
    try {
      const res = await api.post("/customers", newCustomer);
      const created = res.data;

      // Actualiza catálogo in-memory sin duplicados
      setCustomers((prev) => {
        const next = [created, ...prev];
        const map = new Map(next.map((c) => [c.customerId, c]));
        return Array.from(map.values());
      });
      setSelectedCustomer(created);
      closeNewCustomer();
      notify("Cliente creado y seleccionado");
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 409) {
        notify("Ya existe un cliente con ese email o documento", "error");
      } else {
        notify("Error creando el cliente", "error");
      }
    } finally {
      setCreatingCustomer(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        Registro de ventas
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {/* Cliente */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Autocomplete
                fullWidth
                options={customers}
                value={selectedCustomer}
                onChange={(_, val) => setSelectedCustomer(val)}
                onInputChange={(_, q) => searchCustomers(q)}
                getOptionLabel={(c) =>
                  c ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() : ""
                }
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" size="small" />
                )}
              />
              <Tooltip title="Nuevo cliente">
                <IconButton color="primary" onClick={openNewCustomer}>
                  <PersonAddAlt1Icon />
                </IconButton>
              </Tooltip>
            </Stack>

            {selectedCustomer && (
              <Box mt={1} sx={{ color: "text.secondary", fontSize: 13 }}>
                <div>
                  <strong>Documento:</strong> {selectedCustomer.documentId || "-"}
                </div>
                <div>
                  <strong>Teléfono:</strong> {selectedCustomer.phone || "-"}
                </div>
                <div>
                  <strong>Email:</strong> {selectedCustomer.email || "-"}
                </div>
                <div>
                  <strong>Ciudad:</strong> {selectedCustomer.city || "-"}
                </div>
                <div>
                  <strong>Dirección:</strong> {selectedCustomer.address || "-"}
                </div>
              </Box>
            )}
          </Grid>

          {/* Fecha y Remisión */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Fecha de venta"
              type="datetime-local"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Remisión"
              value={remisionVenta}
              onChange={(e) => setRemisionVenta(e.target.value)}
            />
          </Grid>

          {/* Selects: Canal, Pago, Tipo */}
          <Grid item xs={12} md={4}>
            <Select
              fullWidth
              size="small"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              displayEmpty
            >
              {CHANNELS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} md={4}>
            <Select
              fullWidth
              size="small"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              displayEmpty
            >
              {PAYMENT_METHODS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} md={4}>
            <Select
              fullWidth
              size="small"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              displayEmpty
            >
              {TRANSACTION_TYPES.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {transactionType === "Alquiler" && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha de devolución"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* LÍNEAS DE PRODUCTO */}
        <Stack spacing={1}>
          {items.map((row, idx) => (
            <Grid container spacing={1} alignItems="center" key={`line-${idx}`}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  options={products}
                  value={row.product}
                  onChange={(_, p) => handleSelectProduct(idx, p)}
                  getOptionLabel={(p) =>
                    p ? `${p.name} — ${p.brand ?? ""}`.trim() : ""
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Producto" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <TextField
                  type="number"
                  size="small"
                  label="Cantidad"
                  value={row.qty}
                  onChange={(e) =>
                    updateItem(idx, { qty: Number(e.target.value || 0) })
                  }
                  inputProps={{ min: 1 }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <TextField
                  type="number"
                  size="small"
                  label="Precio"
                  value={row.price}
                  onChange={(e) =>
                    updateItem(idx, { price: Number(e.target.value || 0) })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={3} md={1.5}>
                <TextField
                  size="small"
                  label="Total"
                  value={row.lineTotal.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={1} md={0.5} sx={{ display: "flex", justifyContent: "end" }}>
                <Tooltip title="Eliminar línea">
                  <span>
                    <IconButton
                      color="error"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          ))}
          <Box>
            <Button
              startIcon={<AddIcon />}
              onClick={addItem}
              variant="outlined"
              size="small"
            >
              Añadir producto
            </Button>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">
            Total venta:{" "}
            <strong>
              {totalVenta.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
            </strong>
          </Typography>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={submit} disabled={loading}>
            Guardar venta
          </Button>
        </Stack>
      </Paper>

      {/* HISTORIAL */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Typography variant="h6">Historial</Typography>
          <IconButton onClick={loadSales}>
            {historyLoading ? <CircularProgress size={20} /> : <RefreshIconLite />}
          </IconButton>
        </Stack>

        {sales.length === 0 ? (
          <Typography color="text.secondary">Sin ventas registradas.</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={th}>Fecha</th>
                  <th style={th}>Remisión</th>
                  <th style={th}>Cliente</th>
                  <th style={th}>Producto</th>
                  <th style={th}>Cant.</th>
                  <th style={th}>Canal</th>
                  <th style={th}>Pago</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.saleId}>
                    <td style={td}>
                      {s.saleDate
                        ? dayjs(s.saleDate).format("YYYY-MM-DD HH:mm")
                        : s.createdAt
                        ? dayjs(s.createdAt).format("YYYY-MM-DD HH:mm")
                        : "-"}
                    </td>
                    <td style={td}>{s.remisionVenta || "-"}</td>
                    <td style={td}>{s.customerName || s.customerId || "-"}</td>
                    <td style={td}>{s.productName || s.productId || "-"}</td>
                    <td style={td}>{s.unitQty ?? "-"}</td>
                    <td style={td}>{s.channel || "-"}</td>
                    <td style={td}>{s.paymentMethod || "-"}</td>
                    <td style={td}>
                      {typeof s.saleValue === "number"
                        ? s.saleValue.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnack} severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* DIALOGO CREAR CLIENTE */}
      <Dialog open={openCreateCustomer} onClose={closeNewCustomer} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo cliente</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Nombre *"
                value={newCustomer.firstName}
                onChange={(e) =>
                  setNewCustomer((c) => ({ ...c, firstName: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Apellido"
                value={newCustomer.lastName}
                onChange={(e) =>
                  setNewCustomer((c) => ({ ...c, lastName: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Documento"
                value={newCustomer.documentId}
                onChange={(e) =>
                  setNewCustomer((c) => ({ ...c, documentId: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Teléfono"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer((c) => ({ ...c, phone: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer((c) => ({ ...c, email: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Ciudad"
                value={newCustomer.city}
                onChange={(e) =>
                  setNewCustomer((c) => ({ ...c, city: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Dirección"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer((c) => ({ ...c, address: e.target.value }))
                }
              />
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            * El nombre es obligatorio. Debes proporcionar **email** o **documento** (al menos uno).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewCustomer} disabled={creatingCustomer}>
            Cancelar
          </Button>
          <Button
            onClick={submitCreateCustomer}
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
            disabled={creatingCustomer}
          >
            {creatingCustomer ? "Creando..." : "Crear y seleccionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Estilos de tabla
const th = { padding: "8px 6px", borderBottom: "1px solid #e0e0e0" };
const td = { padding: "8px 6px", borderBottom: "1px solid #f0f0f0" };

// Icono liviano de refrescar
function RefreshIconLite(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" {...props} style={{ opacity: 0.8 }}>
      <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c2.76 0 5 2.24 5 5a5 5 0 0 1-8.66 3.54l-1.42 1.42A6.99 6.99 0 0 0 19 12c0-1.93-.78-3.68-2.05-4.95z"></path>
    </svg>
  );
}
