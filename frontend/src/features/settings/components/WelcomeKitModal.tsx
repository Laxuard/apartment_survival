import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import {
  IconX,
  IconPrinter,
  IconCopy,
  IconHome,
  IconWifi,
  IconClock,
  IconPhone,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface WelcomeKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartmentName: string;
  description?: string;
  wifiSsid?: string;
  wifiPassword?: string;
}

export const WelcomeKitModal: React.FC<WelcomeKitModalProps> = ({
  isOpen,
  onClose,
  apartmentName,
  description = '',
  wifiSsid = '',
  wifiPassword = '',
}) => {
  if (!isOpen) return null;

  const wifiQrPayload = `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `🏠 Welcome to ${apartmentName}!\n📍 ${description}\n\n📶 WiFi Network: ${wifiSsid}\n🔑 WiFi Password: ${wifiPassword}\n\n🕒 Quiet Hours: 10:00 PM – 8:00 AM\n🗑️ Trash Days: Tuesdays & Thursdays\n\n🚨 Emergency Contacts:\n• Landlord: +212 6 00 11 22 33\n• Plumber: +212 6 11 22 33 44\n• Locksmith: +212 6 22 33 44 55`;
    navigator.clipboard.writeText(summary);
    toast.success('Welcome summary copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div className="card-custom max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[var(--border-strong)] animate-fade-in max-h-[92vh] overflow-y-auto print:shadow-none print:border-none print:max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--oak)] text-white flex items-center justify-center shadow-xs">
              <IconHome size={22} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[var(--text)] print:text-black">
                {apartmentName} · Welcome & Living Kit
              </h2>
              <p className="text-xs text-[var(--muted)] print:text-gray-600">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[var(--border)] hover:bg-[var(--canvas)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer print:hidden"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* 2-Column Living Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Left (7 Cols): WiFi & Access */}
          <div className="md:col-span-7 p-5 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
              <IconWifi size={16} className="text-[var(--oak)]" />
              <span>Shared WiFi Network</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-[var(--border)] shrink-0">
                <QRCodeSVG
                  value={wifiQrPayload}
                  size={95}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#1D1913"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="text-xs text-[var(--muted)]">Network Name (SSID)</div>
                <div className="text-xs font-bold text-[var(--text)] font-mono truncate">{wifiSsid}</div>
                <div className="text-xs text-[var(--muted)] pt-1">Password</div>
                <div className="text-xs font-bold text-[var(--text)] font-mono truncate">{wifiPassword}</div>
              </div>
            </div>

            <p className="text-[10.5px] text-[var(--muted)]">
              Scan with any phone camera to instantly connect without entering credentials.
            </p>
          </div>

          {/* Right (5 Cols): House Guidelines */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
              <IconClock size={16} className="text-[var(--sage)]" />
              <span>House Guidelines</span>
            </div>

            <ul className="text-xs text-[var(--muted)] space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-[var(--oak)] font-bold">•</span>
                <span><strong>Quiet Hours:</strong> 10:00 PM – 8:00 AM on weekdays.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[var(--oak)] font-bold">•</span>
                <span><strong>Kitchen Rule:</strong> Wash pots & pans within 2 hours.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[var(--oak)] font-bold">•</span>
                <span><strong>Trash Collection:</strong> Tuesday & Thursday evenings.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Contacts Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
            <IconPhone size={16} className="text-[var(--oak)]" />
            <span>Emergency & Maintenance Directory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)]">
              <div className="text-[10.5px] text-[var(--muted)]">Landlord / Concierge</div>
              <div className="text-xs font-bold text-[var(--text)] mt-0.5">+212 6 00 11 22 33</div>
              <div className="text-[10px] text-[var(--muted)]">Building Office</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)]">
              <div className="text-[10.5px] text-[var(--muted)]">Emergency Plumber</div>
              <div className="text-xs font-bold text-[var(--text)] mt-0.5">+212 6 11 22 33 44</div>
              <div className="text-[10px] text-[var(--muted)]">Water & Heating</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)]">
              <div className="text-[10.5px] text-[var(--muted)]">24/7 Locksmith</div>
              <div className="text-xs font-bold text-[var(--text)] mt-0.5">+212 6 22 33 44 55</div>
              <div className="text-[10px] text-[var(--muted)]">Keys & Lockouts</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <IconShieldCheck size={15} className="text-[var(--sage)]" />
            <span>Apartment OS Living Document</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopySummary}
              className="btn-spring px-3.5 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--canvas)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <IconCopy size={14} />
              <span>Copy Text</span>
            </button>

            <Button
              type="button"
              onClick={handlePrint}
              className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <IconPrinter size={14} />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

