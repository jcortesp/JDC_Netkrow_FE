import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import axiosClient from '../api/axiosClient';

export interface PendingWhatsApp {
  remissionId: string;
  recordId: number;
  equipo: string;
}

export default function WhatsAppConfirmation({ pending, onClose, onConfirmed }: {
  pending: PendingWhatsApp | null;
  onClose: () => void;
  onConfirmed: (recordId: number) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    if (!pending || saving) return;
    setSaving(true);
    setError('');
    try {
      await axiosClient.post(`/remissions/${encodeURIComponent(pending.remissionId)}/technical-records/${pending.recordId}/whatsapp/reminder`);
      onConfirmed(pending.recordId);
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
      <DialogTitle>Confirmar recordatorio · {pending?.remissionId} · {pending?.equipo}</DialogTitle>
      <DialogContent>
        Envía el mensaje en WhatsApp y luego pulsa «Ya lo envié». El próximo recordatorio estará disponible 15 días después de esta confirmación. La fecha en que quedó listo no cambia.
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
