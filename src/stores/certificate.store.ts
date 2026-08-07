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
}

// SEED TEMPLATE CONFIGURATIONS (EVERY DYNAMIC FIELD IS ALWAYS MANDATORY & STUDENT EDITABLE)
const DEFAULT_COURSE_CONFIGS: Record<string, CourseCertificateConfig> = {
  '9c78bda1-98c2-4b11-8b81-92d3db12b501': {
    templateUuid: 'tmpl-react19-mastery',
    templateName: 'React 19 & Cloud Architecture Official Certificate',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    creationMethod: 'custom_builder',
    certificateEnabled: true,
    dynamicFields: [
      {
        uuid: 'df-1',
        key: 'certificate_printed_name',
        label: 'Certificate Printed Name',
        type: 'text',
        placeholder: 'Enter full legal name (e.g. Arun Rahul Menon)',
        helpText: 'Enter your exact full name to be printed on certificate (do not use account nickname/initials).',
      },
      {
        uuid: 'df-2',
        key: 'date_of_birth',
        label: 'Date of Birth',
        type: 'date',
        placeholder: 'YYYY-MM-DD',
        helpText: 'Mandatory date of birth for accreditation verification.',
      },
      {
        uuid: 'df-3',
        key: 'registration_number',
        label: 'Academy Registration Number',
        type: 'text',
        placeholder: 'e.g. REG-2026-9901',
        helpText: 'Mandatory student registration number.',
      },
      {
        uuid: 'df-4',
        key: 'passport_national_id',
        label: 'Passport / National Identity Number',
        type: 'text',
        placeholder: 'e.g. A-9842109',
        helpText: 'Mandatory identity document number.',
      },
    ],
  },
};

export const useStudentCertificateStore = create<StudentCertificateStoreState>()(
  persist(
    (set, get) => ({
      courseConfigs: DEFAULT_COURSE_CONFIGS,
      studentFieldValues: [
        {
          uuid: 'val-1',
          academyUuid: '550e8400-e29b-41d4-a716-446655440000',
          courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
          templateUuid: 'tmpl-react19-mastery',
          studentUuid: 'std-alex-001',
          fieldUuid: 'df-1',
          fieldKey: 'certificate_printed_name',
          value: 'Arun Rahul Menon',
          updatedAt: new Date().toISOString(),
        },
        {
          uuid: 'val-2',
          academyUuid: '550e8400-e29b-41d4-a716-446655440000',
          courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
          templateUuid: 'tmpl-react19-mastery',
          studentUuid: 'std-alex-001',
          fieldUuid: 'df-2',
          fieldKey: 'date_of_birth',
          value: '2001-05-12',
          updatedAt: new Date().toISOString(),
        },
      ],
      generatedCertificates: {},

      getCertificateTemplate: (courseUuid) => {
        return get().courseConfigs[courseUuid] || null;
      },

      getCertificateFields: (courseUuid) => {
        const config = get().courseConfigs[courseUuid];
        return config?.certificateEnabled ? config.dynamicFields : [];
      },

      getTemplateFieldsForCourse: (courseUuid) => {
        return get().getCertificateFields(courseUuid);
      },

      getStudentCertificateFieldValues: (courseUuid) => {
        const values = get().studentFieldValues.filter((v) => v.courseUuid === courseUuid);
        const map: Record<string, string | number | boolean | null> = {};
        values.forEach((v) => {
          map[v.fieldKey] = v.value;
        });
        return map;
      },

      saveStudentCertificateDetails: ({ academyUuid, courseUuid, templateUuid, studentUuid, values }) => {
        set((state) => {
          const filtered = state.studentFieldValues.filter((v) => v.courseUuid !== courseUuid);
          const newEntries: StudentCertificateFieldValue[] = Object.entries(values).map(([fieldKey, val], idx) => ({
            uuid: `val-${Date.now()}-${idx}`,
            academyUuid,
            courseUuid,
            templateUuid,
            studentUuid,
            fieldUuid: `field-${fieldKey}`,
            fieldKey,
            value: val,
            updatedAt: new Date().toISOString(),
          }));
          return { studentFieldValues: [...filtered, ...newEntries] };
        });

        // Trigger automatic certificate generation check
        get().generateCertificate(courseUuid);
      },

      saveCertificateFieldValues: (params) => {
        get().saveStudentCertificateDetails(params);
      },

      isCertificateProfileComplete: (courseUuid) => {
        const fields = get().getCertificateFields(courseUuid);
        const currentValues = get().getStudentCertificateFieldValues(courseUuid);

        let completedCount = 0;
        // EVERY FIELD IS MANDATORY. NO EXCEPTIONS.
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
        const certNumber = `CS-CERT-2026-98741`;
        const printedName = String(studentValues.certificate_printed_name || '');

        if (!profileStatus.isComplete || !printedName.trim()) {
          const incompleteRecord: GeneratedCertificateRecord = {
            uuid: certUuid,
            certificateNumber: certNumber,
            courseUuid,
            templateUuid: config.templateUuid,
            creationMethod: config.creationMethod,
            studentName: printedName || 'A. Rahul (Incomplete)',
            studentPrintedName: printedName,
            courseTitle: 'React 19 & Cloud Architecture',
            academyName: 'Bright Academy of Technology',
            instructorName: 'John Instructor',
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
        };

        // Complete & Ready to Download (Uses exact student-entered values)
        const readyRecord: GeneratedCertificateRecord = {
          uuid: certUuid,
          certificateNumber: certNumber,
          courseUuid,
          templateUuid: config.templateUuid,
          creationMethod: config.creationMethod,
          studentName: printedName,
          studentPrintedName: printedName,
          courseTitle: 'React 19 & Cloud Architecture',
          academyName: 'Bright Academy of Technology',
          instructorName: 'John Instructor',
          issuedAt: new Date().toISOString().split('T')[0],
          status: 'Ready to Download',
          mergedValues: {
            ...studentValues,
            course_title: 'React 19 & Cloud Architecture',
            academy_name: 'Bright Academy of Technology',
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
    }),
    {
      name: 'cubixskill-student-certificate-store',
    }
  )
);
