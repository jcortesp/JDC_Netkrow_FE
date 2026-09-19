import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import axiosClient from '../api/axiosClient';

export interface PendingWhatsApp {
  remissionId: string;
  kind: 'ready' | 'reminder';
}

export default function WhatsAppConfirmation({ pending, onClose, onConfirmed }: {
  pending: PendingWhatsApp | null;
  onClose: () => void;
  onConfirmed: (remissionId: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    if (!pending || saving) return;
    setSaving(true);
    setError('');
    try {
      await axiosClient.post(`/remissions/${encodeURIComponent(pending.remissionId)}/whatsapp/${pending.kind}`);
      onConfirmed(pending.remissionId);
      onClose();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.message
        ? e.response.data.message : 'No fue posible registrar el envío. Puedes reintentar sin volver a enviar el mensaje.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(pending)} onClose={() => { if (!saving) { setError(''); onClose(); } }}>
      <DialogTitle>Confirmar envío · {pending?.remissionId}</DialogTitle>
      <DialogContent>
        Envía el mensaje en WhatsApp y luego pulsa «Ya lo envié». Los 15 días se cuentan desde esta confirmación.
        Si no lo enviaste, cancela para conservar el aviso pendiente.
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={() => { setError(''); onClose(); }}>Cancelar</Button>
        <Button disabled={saving} variant="contained" onClick={confirm}>{saving ? 'Guardando…' : 'Ya lo envié'}</Button>
      </DialogActions>
    </Dialog>
  );
}
