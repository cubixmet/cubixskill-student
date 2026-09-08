import { create } from 'zustand';

export interface DynamicCertificateTemplateField {
  uuid: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'email' | 'phone' | 'select' | 'radio' | 'checkbox' | 'url';
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: string;
  order?: number;
  required?: boolean;
}

export interface StudentCertificateFieldValue {
  uuid: string;
  academyUuid: string;
  courseUuid: string;
  templateUuid: string;
  studentUuid: string;
  fieldUuid: string;
  fieldKey: string;
  value: string | number | boolean | null;
  updatedAt: string;
}

export interface GeneratedCertificateRecord {
  uuid: string;
  certificateNumber: string;
  courseUuid: string;
  templateUuid: string;
  creationMethod?: 'custom_builder' | 'uploaded_template';
  studentName: string;
  studentPrintedName?: string;
  courseTitle: string;
  academyName: string;
  instructorName: string;
  issuedAt: string;
  status: string;
  pdfUrl?: string;
  pngUrl?: string;
  verificationUrl?: string;
  qrCodeUrl?: string;
}

interface StudentCertificateStoreState {
  // Transient UI active filter / state
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useCertificateStore = create<StudentCertificateStoreState>()((set) => ({
  activeTab: 'All',
  setActiveTab: (tab: string) => set({ activeTab: tab }),
}));

export const useStudentCertificateStore = useCertificateStore;
