import type { FC } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Building2, Phone, QrCode } from 'lucide-react';
import type { Registration } from '../services/types';
import { StatusBadge, formatDateTime, formatDate } from '../components/ui';

export const RegistrationCard: FC<{ reg: Registration; actions?: FC<{ reg: Registration }> }> = ({
  reg,
  actions: Actions,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
  >
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-lg shrink-0">
        {reg.visitor_name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-gray-900">{reg.visitor_name}</h3>
          <StatusBadge status={reg.status} />
        </div>
        <p className="text-sm text-gray-500 font-medium truncate">{reg.visitor_email}</p>

        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-500">
          {reg.event && (
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {reg.event.title} · {formatDate(reg.event.event_date)}
            </span>
          )}
          {reg.organization && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              {reg.organization}
            </span>
          )}
          {reg.phone && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              {reg.phone}
            </span>
          )}
          <span className="text-gray-400">Requested {formatDateTime(reg.created_at)}</span>
        </div>

        {reg.qr_code && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5" />
            Pass: {reg.qr_code.slice(0, 18)}…
          </div>
        )}
      </div>

      {Actions && <Actions reg={reg} />}
    </div>
  </motion.div>
);
