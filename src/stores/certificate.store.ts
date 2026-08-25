import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  creationMethod: 'custom_builder' | 'uploaded_template';
  studentName: string;
  studentPrintedName: string;
  courseTitle: string;
  academyName: string;
  instructorName: string;
  issuedAt: string;
  status: 'Details Required' | 'Processing' | 'Ready to Download' | 'Generation Failed';
  mergedValues: Record<string, string | number | boolean | null>;
  pdfUrl: string;
  pngUrl: string;
  verificationUrl: string;
  qrCodeUrl: string;
}

export interface CourseCertificateConfig {
  templateUuid: string;
  templateName: string;
  courseUuid: string;
  creationMethod: 'custom_builder' | 'uploaded_template';
  certificateEnabled: boolean;
  dynamicFields: DynamicCertificateTemplateField[];
}

interface StudentCertificateStoreState {
  courseConfigs: Record<string, CourseCertificateConfig>;
  studentFieldValues: StudentCertificateFieldValue[];
  generatedCertificates: Record<string, GeneratedCertificateRecord>;

  getCertificateTemplate: (courseUuid: string) => CourseCertificateConfig | null;
  getCertificateFields: (courseUuid: string) => DynamicCertificateTemplateField[];
  getTemplateFieldsForCourse: (courseUuid: string) => DynamicCertificateTemplateField[];
  getStudentCertificateFieldValues: (courseUuid: string) => Record<string, string | number | boolean | null>;
  saveStudentCertificateDetails: (params: {
    academyUuid: string;
    courseUuid: string;
    templateUuid: string;
    studentUuid: string;
    values: Record<string, string | number | boolean | null>;
  }) => void;
  saveCertificateFieldValues: (params: {
    academyUuid: string;
    courseUuid: string;
    templateUuid: string;
    studentUuid: string;
    values: Record<string, string | number | boolean | null>;
  }) => void;
  isCertificateProfileComplete: (courseUuid: string) => { isComplete: boolean; completedCount: number; totalRequiredCount: number };
  generateCertificate: (courseUuid: string) => GeneratedCertificateRecord | null;
  downloadCertificate: (courseUuid: string, format: 'pdf' | 'png') => { success: boolean; filename: string };
  reset: () => void;
}

export const useCertificateStore = create<StudentCertificateStoreState>()(
  persist(
    (set, get) => ({
      courseConfigs: {},
      studentFieldValues: [],
      generatedCertificates: {},

      getCertificateTemplate: (courseUuid) => {
        return get().courseConfigs[courseUuid] || null;
      },

      getCertificateFields: (courseUuid) => {
        const config = get().getCertificateTemplate(courseUuid);
        return config?.dynamicFields || [];
      },

      getTemplateFieldsForCourse: (courseUuid) => {
        return get().getCertificateFields(courseUuid);
      },

      getStudentCertificateFieldValues: (courseUuid) => {
        const recordMap: Record<string, string | number | boolean | null> = {};
        get()
          .studentFieldValues.filter((fv) => fv.courseUuid === courseUuid)
          .forEach((fv) => {
            recordMap[fv.fieldKey] = fv.value;
          });
        return recordMap;
      },

      saveStudentCertificateDetails: (params) => {
        const { academyUuid, courseUuid, templateUuid, studentUuid, values } = params;
        const now = new Date().toISOString();

        set((state) => {
          const filtered = state.studentFieldValues.filter(
            (fv) => !(fv.courseUuid === courseUuid && fv.studentUuid === studentUuid)
          );

          const updatedEntries: StudentCertificateFieldValue[] = Object.entries(values).map(([fieldKey, val]) => ({
            uuid: `val-${Date.now()}-${fieldKey}`,
            academyUuid,
            courseUuid,
            templateUuid,
            studentUuid,
            fieldUuid: `field-${fieldKey}`,
            fieldKey,
            value: val,
            updatedAt: now,
          }));

          return {
            studentFieldValues: [...filtered, ...updatedEntries],
          };
        });
      },

      saveCertificateFieldValues: (params) => {
        get().saveStudentCertificateDetails(params);
      },

      isCertificateProfileComplete: (courseUuid) => {
        const fields = get().getCertificateFields(courseUuid);
        const currentValues = get().getStudentCertificateFieldValues(courseUuid);

        let completedCount = 0;
        fields.forEach((f) => {
          const val = currentValues[f.key];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            completedCount++;
          }
        });

        return {
          isComplete: completedCount >= fields.length && fields.length > 0,
          completedCount,
          totalRequiredCount: fields.length,
        };
      },

      generateCertificate: (courseUuid) => {
        const config = get().getCertificateTemplate(courseUuid);
        if (!config || !config.certificateEnabled) return null;

        const profileStatus = get().isCertificateProfileComplete(courseUuid);
        const studentValues = get().getStudentCertificateFieldValues(courseUuid);

        const certUuid = `cert-${courseUuid}`;
        const certNumber = `CS-CERT-${Date.now().toString().slice(-6)}`;
        const printedName = String(studentValues.certificate_printed_name || '');

        if (!profileStatus.isComplete || !printedName.trim()) {
          const incompleteRecord: GeneratedCertificateRecord = {
            uuid: certUuid,
            certificateNumber: certNumber,
            courseUuid,
            templateUuid: config.templateUuid,
            creationMethod: config.creationMethod,
            studentName: printedName || 'Student Name',
            studentPrintedName: printedName,
            courseTitle: 'Course Title',
            academyName: 'Academy Name',
            instructorName: 'Instructor Name',
            issuedAt: new Date().toISOString().split('T')[0],
            status: 'Details Required',
            mergedValues: studentValues,
            pdfUrl: '',
            pngUrl: '',
            verificationUrl: `${window.location.origin}/verify/certificate/${certNumber}`,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
              `${window.location.origin}/verify/certificate/${certNumber}`
            )}`,
          };
          set((state) => ({
            generatedCertificates: { ...state.generatedCertificates, [courseUuid]: incompleteRecord },
          }));
          return incompleteRecord;
        }

        const readyRecord: GeneratedCertificateRecord = {
          uuid: certUuid,
          certificateNumber: certNumber,
          courseUuid,
          templateUuid: config.templateUuid,
          creationMethod: config.creationMethod,
          studentName: printedName,
          studentPrintedName: printedName,
          courseTitle: 'Course Title',
          academyName: 'Academy Name',
          instructorName: 'Instructor Name',
          issuedAt: new Date().toISOString().split('T')[0],
          status: 'Ready to Download',
          mergedValues: {
            ...studentValues,
            issue_date: new Date().toISOString().split('T')[0],
          },
          pdfUrl: `/downloads/certificates/${certNumber}.pdf`,
          pngUrl: `/downloads/certificates/${certNumber}.png`,
          verificationUrl: `${window.location.origin}/verify/certificate/${certNumber}`,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
            `${window.location.origin}/verify/certificate/${certNumber}`
          )}`,
        };

        set((state) => ({
          generatedCertificates: { ...state.generatedCertificates, [courseUuid]: readyRecord },
        }));

        return readyRecord;
      },

      downloadCertificate: (courseUuid, format) => {
        const cert = get().generatedCertificates[courseUuid];
        if (!cert || cert.status !== 'Ready to Download') {
          return { success: false, filename: '' };
        }
        return {
          success: true,
          filename: `${cert.certificateNumber}.${format}`,
        };
      },

      reset: () => set({ courseConfigs: {}, studentFieldValues: [], generatedCertificates: {} }),
    }),
    {
      name: 'cubixskill-student-certificate-store',
    }
  )
);

export const useStudentCertificateStore = useCertificateStore;
