"use client";

import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardContext } from "@/context/DashboardContext";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Award,
  Bold,
  CalendarDays,
  FileUp,
  Grip,
  Hash,
  Italic,
  Loader2,
  QrCode,
  RotateCcw,
  Save,
  Signature,
  Trash2,
  Type,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { toast } from "sonner";

type CertificateFieldType =
  | "participantName"
  | "trainingName"
  | "certificateId"
  | "issuedDate"
  | "trainerName"
  | "trainerSignature"
  | "signatureImage"
  | "signature"
  | `section-${number}`
  | `admin-${number}`
  | `module-${number}`
  | "instructorName"
  | "qrCode";

type CertificateField = {
  instanceId: string;
  id: CertificateFieldType;
  label: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  maxWidth: number;
  fontSize: number;
  color: string;
  font: string;
  fontFamily: string;
  italic: boolean;
  isVariable: boolean;
  lineHeight: number;
  paragraphStyle: "normal" | "heading1" | "heading2" | "heading3" | "caption";
  paragraphSpacing: number;
  rotate: number;
  align: "left" | "center" | "right";
  weight: "normal" | "semibold" | "bold";
};

type CertificateTemplate = {
  templateName: string;
  page: number;
  canvas: {
    width: number;
    height: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    previewUrl?: string;
    backgroundColor: string;
  };
  fields: CertificateField[];
};

type Props = {
  classId: string;
  certificateId: string;
};

type CertificateDetail = {
  id: number;
  moduleId: number;
  templateCertificate?: CertificateTemplatePage[] | null;
  module?: {
    id: number;
    name?: string;
    title?: string;
    section?: {
      id: number;
      name?: string;
      title?: string;
    };
    class?: {
      id: number;
      name?: string;
      title?: string;
      instructor?: {
        id: number;
        userId: number;
        user?: {
          id: number;
          name?: string;
          userSign?: string | null;
        };
      } | null;
      admins?: Array<{
        id: number;
        userId: number;
        user?: {
          id: number;
          name?: string;
          userSign?: string | null;
        };
      }>;
      sections?: Array<{
        id: number;
        title?: string;
        name?: string;
        position?: number;
        publish?: boolean;
        type?: string;
      }>;
    };
  };
};

type CertificateTemplateUploadTarget = {
  classId: number;
  sectionId: number;
  moduleId: number;
};

type CertificateTemplateAttribute = Record<string, any>;

type CertificateTemplatePage = {
  id: number;
  certificateId: number;
  size?: number;
  maxSizeX?: number;
  maxSizeY?: number;
  fileName: string;
  fileUrl: string;
  presignedUrl?: string;
  certificateAttributes?: CertificateTemplateAttribute[];
};

type PdfCoordinatePage = {
  page: number;
  templateId?: number;
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  fields?: CertificateField[];
  previewUrl?: string;
  imageUrl?: string;
  templateUrl?: string;
  url?: string;
};

type PdfCoordinateBounds = {
  templateName: string;
  templatePath: string;
  totalPages: number;
  pages: PdfCoordinatePage[];
  previewUrl?: string;
  imageUrl?: string;
  templateUrl?: string;
  url?: string;
};

type FieldContextMenu = {
  instanceId: string;
  x: number;
  y: number;
} | null;

type CertificateFieldMeta = {
  id: CertificateFieldType;
  label: string;
  value: string;
  exampleValue: string;
  icon: ReactNode;
};

type CertificateFieldCategory = {
  id: string;
  label: string;
  description: string;
  fields: CertificateFieldMeta[];
};

type CertificateFieldDefinition = {
  fieldId: string;
  type: "text" | "image" | "qrcode" | string;
  table: string;
  key: string;
  action: "READ" | "GENERATE" | string;
  referencesId?: string | number | null;
  value?: string | null;
};

type CertificateFieldDefinitionResponse = {
  fields?: CertificateFieldDefinition[];
};

type CertificateAttributePayload =
  | {
      templateCertificateId: number;
      type: "text";
      fieldName: string;
      value: string;
      coordinatesX: number;
      coordinatesY: number;
      width: number;
      height: number;
      fontSize: number;
      color: string;
      font: string;
      format: string;
      paragraphStyle: string;
      lineHeight: number;
      rotate: number;
      align: CertificateField["align"];
    }
  | {
      templateCertificateId: number;
      type: "sign";
      userId?: number;
      fieldName: string;
      coordinatesX: number;
      coordinatesY: number;
      width: number;
      height: number;
    }
  | {
      templateCertificateId: number;
      type: "qr";
      fieldName: string;
      coordinatesX: number;
      coordinatesY: number;
      size: number;
    };

const CERTIFICATE_TEMPLATE_NAME = "contoh_template.pdf";
const DEFAULT_PAGE_BOUNDS: PdfCoordinatePage = {
  page: 1,
  width: 841,
  height: 595,
  minX: 0,
  maxX: 841,
  minY: 0,
  maxY: 595,
};

const getPdfTemplateUrl = (templateName: string) =>
  `/api/pdf-template/${encodeURIComponent(templateName)}`;
const DEFAULT_TEXT_FONT_SIZE = 22;

const FIELD_META: CertificateFieldMeta[] = [
  {
    id: "participantName",
    label: "Nama Peserta",
    value: "{{nama_peserta}}",
    exampleValue: "Nama Peserta",
    icon: <Type className="h-4 w-4" />,
  },
  {
    id: "trainingName",
    label: "Nama Kelas",
    value: "{{nama_kelas}}",
    exampleValue: "Nama Kelas",
    icon: <Award className="h-4 w-4" />,
  },
  {
    id: "certificateId",
    label: "ID Sertifikat",
    value: "{{nomor_sertifikat}}",
    exampleValue: "CERT-0001",
    icon: <Hash className="h-4 w-4" />,
  },
  {
    id: "issuedDate",
    label: "Tanggal",
    value: "{{tanggal_terbit}}",
    exampleValue: "18 Juli 2026",
    icon: <CalendarDays className="h-4 w-4" />,
  },
  {
    id: "trainerName",
    label: "Nama Trainer",
    value: "{{nama_trainer}}",
    exampleValue: "Nama Trainer",
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    id: "trainerSignature",
    label: "Tanda Tangan Trainer",
    value: "{{tanda_tangan_trainer}}",
    exampleValue: "Tanda Tangan Trainer",
    icon: <Signature className="h-4 w-4" />,
  },
  {
    id: "signature",
    label: "Nama Penandatangan",
    value: "{{nama_penandatangan}}",
    exampleValue: "Nama Penandatangan",
    icon: <Signature className="h-4 w-4" />,
  },
  {
    id: "signatureImage",
    label: "Tanda Tangan",
    value: "{{tanda_tangan}}",
    exampleValue: "Tanda Tangan",
    icon: <Signature className="h-4 w-4" />,
  },
  {
    id: "instructorName",
    label: "Instructor",
    value: "{{instructor}}",
    exampleValue: "Pengajar",
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    id: "qrCode",
    label: "QR Code",
    value: "{{url_verifikasi}}",
    exampleValue: "https://certificate.mindoeducation.co.id/verify/CERT-0001",
    icon: <QrCode className="h-4 w-4" />,
  },
];

const SIGNATURE_FIELD_IDS: CertificateFieldType[] = [
  "trainerSignature",
  "signatureImage",
];

const isSignatureField = (fieldId: CertificateFieldType) =>
  SIGNATURE_FIELD_IDS.includes(fieldId);

const FONT_OPTIONS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Tahoma",
  "Poppins",
];

const PARAGRAPH_STYLE_OPTIONS: Array<{
  label: string;
  value: CertificateField["paragraphStyle"];
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  weight: CertificateField["weight"];
}> = [
  {
    label: "Header 1",
    value: "heading1",
    fontSize: 34,
    lineHeight: 1.12,
    paragraphSpacing: 12,
    weight: "bold",
  },
  {
    label: "Header 2",
    value: "heading2",
    fontSize: 26,
    lineHeight: 1.16,
    paragraphSpacing: 10,
    weight: "bold",
  },
  {
    label: "Header 3",
    value: "heading3",
    fontSize: 20,
    lineHeight: 1.2,
    paragraphSpacing: 8,
    weight: "semibold",
  },
  {
    label: "Normal",
    value: "normal",
    fontSize: 15,
    lineHeight: 1.3,
    paragraphSpacing: 8,
    weight: "normal",
  },
  {
    label: "Caption",
    value: "caption",
    fontSize: 12,
    lineHeight: 1.25,
    paragraphSpacing: 6,
    weight: "normal",
  },
];

const createFieldInstanceId = (id: CertificateFieldType) => {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${id}-${randomId}`;
};

const getDefaultFieldStyle = (
  id: CertificateFieldType,
  width: number
): Pick<
  CertificateField,
  | "height"
  | "maxWidth"
  | "color"
  | "font"
  | "fontFamily"
  | "italic"
  | "isVariable"
  | "lineHeight"
  | "paragraphStyle"
  | "paragraphSpacing"
  | "rotate"
> => ({
  height: isSignatureField(id)
    ? Math.round(width * 0.55)
    : id === "qrCode"
      ? width
      : 40,
  maxWidth: width,
  color: "#0f172a",
  font: id === "signature" ? "Georgia" : "Arial",
  fontFamily: id === "signature" ? "Georgia" : "Arial",
  italic: false,
  isVariable: true,
  lineHeight: 1.2,
  paragraphStyle: "normal",
  paragraphSpacing: 8,
  rotate: 0,
});

const getDefaultFields = (bounds: PdfCoordinatePage): CertificateField[] => {
  const width = bounds.width;
  const height = bounds.height;

  return [
    {
      ...getDefaultFieldStyle("participantName", Math.round(width * 0.5)),
      instanceId: createFieldInstanceId("participantName"),
      id: "participantName",
      label: "Nama Peserta",
      value: "{{nama_peserta}}",
      x: Math.round(width * 0.25),
      y: Math.round(height * 0.39),
      width: Math.round(width * 0.5),
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      align: "center",
      weight: "bold",
    },
    {
      ...getDefaultFieldStyle("trainingName", Math.round(width * 0.38)),
      instanceId: createFieldInstanceId("trainingName"),
      id: "trainingName",
      label: "Nama Kelas",
      value: "{{nama_kelas}}",
      x: Math.round(width * 0.31),
      y: Math.round(height * 0.55),
      width: Math.round(width * 0.38),
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      align: "center",
      weight: "semibold",
    },
    {
      ...getDefaultFieldStyle("certificateId", Math.round(width * 0.24)),
      instanceId: createFieldInstanceId("certificateId"),
      id: "certificateId",
      label: "ID Sertifikat",
      value: "{{nomor_sertifikat}}",
      x: Math.round(width * 0.09),
      y: Math.round(height * 0.85),
      width: Math.round(width * 0.24),
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      align: "left",
      weight: "normal",
    },
    {
      ...getDefaultFieldStyle("issuedDate", Math.round(width * 0.24)),
      instanceId: createFieldInstanceId("issuedDate"),
      id: "issuedDate",
      label: "Tanggal",
      value: "{{tanggal_terbit}}",
      x: Math.round(width * 0.38),
      y: Math.round(height * 0.78),
      width: Math.round(width * 0.24),
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      align: "center",
      weight: "normal",
    },
    {
      ...getDefaultFieldStyle("trainerSignature", Math.round(width * 0.12)),
      instanceId: createFieldInstanceId("trainerSignature"),
      id: "trainerSignature",
      label: "Tanda Tangan Trainer",
      value: "{{tanda_tangan_trainer}}",
      x: Math.round(width * 0.68),
      y: Math.round(height * 0.65),
      width: Math.round(width * 0.12),
      fontSize: 12,
      align: "center",
      weight: "normal",
    },
    {
      ...getDefaultFieldStyle("trainerName", Math.round(width * 0.24)),
      instanceId: createFieldInstanceId("trainerName"),
      id: "trainerName",
      label: "Nama Trainer",
      value: "{{nama_trainer}}",
      x: Math.round(width * 0.68),
      y: Math.round(height * 0.72),
      width: Math.round(width * 0.24),
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      align: "center",
      weight: "semibold",
    },
    {
      ...getDefaultFieldStyle("signatureImage", Math.round(width * 0.12)),
      instanceId: createFieldInstanceId("signatureImage"),
      id: "signatureImage",
      label: "Tanda Tangan",
      value: "{{tanda_tangan}}",
      x: Math.round(width * 0.68),
      y: Math.round(height * 0.75),
      width: Math.round(width * 0.12),
      fontSize: 12,
      align: "center",
      weight: "normal",
    },
    {
      ...getDefaultFieldStyle("signature", Math.round(width * 0.24)),
      instanceId: createFieldInstanceId("signature"),
      id: "signature",
      label: "Nama Penandatangan",
      value: "{{nama_penandatangan}}",
      x: Math.round(width * 0.68),
      y: Math.round(height * 0.78),
      width: Math.round(width * 0.24),
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      align: "center",
      weight: "semibold",
    },
    {
      ...getDefaultFieldStyle("qrCode", Math.round(width * 0.11)),
      instanceId: createFieldInstanceId("qrCode"),
      id: "qrCode",
      label: "QR Code",
      value: "{{url_verifikasi}}",
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.68),
      width: Math.round(width * 0.11),
      fontSize: 12,
      align: "center",
      weight: "normal",
    },
  ];
};

const buildDefaultTemplate = (
  bounds: PdfCoordinatePage = DEFAULT_PAGE_BOUNDS
): CertificateTemplate => ({
  templateName: CERTIFICATE_TEMPLATE_NAME,
  page: bounds.page,
  canvas: {
    width: bounds.width,
    height: bounds.height,
    minX: bounds.minX,
    maxX: bounds.maxX,
    minY: bounds.minY,
    maxY: bounds.maxY,
    previewUrl:
      bounds.previewUrl ||
      bounds.imageUrl ||
      bounds.templateUrl ||
      bounds.url,
    backgroundColor: "#ffffff",
  },
  fields: [],
});

const DEFAULT_TEMPLATE: CertificateTemplate = {
  ...buildDefaultTemplate(DEFAULT_PAGE_BOUNDS),
};

const withTemplatePreviewUrls = (
  bounds: PdfCoordinateBounds
): PdfCoordinateBounds => ({
  ...bounds,
  pages: bounds.pages.map((page) => ({
    ...page,
    previewUrl:
      page.previewUrl ||
      page.imageUrl ||
      page.templateUrl ||
      page.url ||
      bounds.previewUrl ||
      bounds.imageUrl ||
      bounds.templateUrl ||
      bounds.url,
  })),
});

const getUploadedTemplateName = (response: any, fallbackName: string) => {
  const data = response?.data || response;
  const rawName =
    data?.templateName ||
    data?.name ||
    data?.fileName ||
    data?.filename ||
    data?.key ||
    data?.path ||
    data?.templatePath ||
    data?.url ||
    fallbackName;

  return String(rawName).split("/").pop() || fallbackName;
};

const hasVariableSyntax = (value: string) => /\{\{[^{}]+\}\}/.test(value);

const isSectionField = (id: CertificateFieldType) =>
  id.startsWith("section-");

const isAdminField = (id: CertificateFieldType) => id.startsWith("admin-");

const isModuleField = (id: CertificateFieldType) => id.startsWith("module-");

const getFieldMeta = (id: CertificateFieldType): CertificateFieldMeta => {
  const staticMeta = FIELD_META.find((field) => field.id === id);

  if (staticMeta) {
    return staticMeta;
  }

  if (isSectionField(id)) {
    const sectionId = id.replace("section-", "");
    return {
      id,
      label: `Section ${sectionId}`,
      value: `{{section_${sectionId}}}`,
      exampleValue: `Section ${sectionId}`,
      icon: <Type className="h-4 w-4" />,
    };
  }

  if (isModuleField(id)) {
    const moduleId = id.replace("module-", "");
    return {
      id,
      label: `Module ${moduleId}`,
      value: `{{module_${moduleId}}}`,
      exampleValue: `Module ${moduleId}`,
      icon: <Type className="h-4 w-4" />,
    };
  }

  const adminId = id.replace("admin-", "");
  return {
    id,
    label: `Admin ${adminId}`,
    value: `{{admin_${adminId}}}`,
    exampleValue: `Admin ${adminId}`,
    icon: <UserRound className="h-4 w-4" />,
  };
};

const getFieldExampleValue = (id: CertificateFieldType) =>
  getFieldMeta(id).exampleValue;

const getFieldVariableValue = (id: CertificateFieldType) =>
  getFieldMeta(id).value;

const isCertificateFieldType = (id: string): id is CertificateFieldType =>
  FIELD_META.some((field) => field.id === id) ||
  /^section-\d+$/.test(id) ||
  /^admin-\d+$/.test(id) ||
  /^module-\d+$/.test(id);

const getFieldIcon = (id: CertificateFieldType) => {
  if (id === "qrCode") {
    return <QrCode className="h-4 w-4" />;
  }

  if (id === "trainerSignature" || id === "signatureImage" || id === "signature") {
    return <Signature className="h-4 w-4" />;
  }

  if (
    id === "trainerName" ||
    id === "instructorName" ||
    isAdminField(id)
  ) {
    return <UserRound className="h-4 w-4" />;
  }

  if (id === "trainingName") {
    return <Award className="h-4 w-4" />;
  }

  if (id === "certificateId") {
    return <Hash className="h-4 w-4" />;
  }

  if (id === "issuedDate") {
    return <CalendarDays className="h-4 w-4" />;
  }

  return <Type className="h-4 w-4" />;
};

const getFieldTagLabel = (id: CertificateFieldType) => {
  if (id === "participantName") {
    return "Peserta";
  }

  if (id === "trainingName") {
    return "Kelas";
  }

  if (id === "certificateId") {
    return "Sertifikat";
  }

  if (id === "issuedDate") {
    return "Tanggal";
  }

  if (id === "trainerName" || id === "instructorName") {
    return "Trainer";
  }

  if (id === "trainerSignature" || id === "signatureImage") {
    return "Tanda tangan";
  }

  if (id === "signature") {
    return "Penandatangan";
  }

  if (id === "qrCode") {
    return "QR";
  }

  if (isSectionField(id)) {
    return "Section";
  }

  if (isModuleField(id)) {
    return "Module";
  }

  if (isAdminField(id)) {
    return "Admin";
  }

  return "Text";
};

const FIELD_CATEGORY_ORDER = [
  "main",
  "certificate",
  "date",
  "section",
  "module",
  "admin",
  "signature",
  "other",
];

const FIELD_CATEGORY_META: Record<
  string,
  { label: string; description: string }
> = {
  main: {
    label: "Data Utama",
    description: "Field peserta, kelas, dan trainer.",
  },
  certificate: {
    label: "Sertifikat",
    description: "Nomor sertifikat dan QR.",
  },
  date: {
    label: "Tanggal",
    description: "Field tanggal penerbitan.",
  },
  section: {
    label: "Section",
    description: "Field berdasarkan section kelas.",
  },
  module: {
    label: "Module",
    description: "Field berdasarkan module.",
  },
  admin: {
    label: "Admin",
    description: "Field nama admin kelas.",
  },
  signature: {
    label: "Tanda Tangan",
    description: "Field penandatangan dan gambar tanda tangan.",
  },
  other: {
    label: "Lainnya",
    description: "Field tambahan dari API.",
  },
};

const getFieldCategoryId = (id: CertificateFieldType) => {
  if (isSectionField(id)) {
    return "section";
  }

  if (isModuleField(id)) {
    return "module";
  }

  if (isAdminField(id)) {
    return "admin";
  }

  if (id === "certificateId" || id === "qrCode") {
    return "certificate";
  }

  if (id === "issuedDate") {
    return "date";
  }

  if (id === "signature" || id === "trainerSignature" || id === "signatureImage") {
    return "signature";
  }

  if (
    id === "participantName" ||
    id === "trainingName" ||
    id === "trainerName" ||
    id === "instructorName"
  ) {
    return "main";
  }

  return "other";
};

const groupCertificateFields = (
  fields: CertificateFieldMeta[]
): CertificateFieldCategory[] => {
  const groupedFields = fields.reduce<Record<string, CertificateFieldMeta[]>>(
    (groups, field) => {
      const categoryId = getFieldCategoryId(field.id);

      return {
        ...groups,
        [categoryId]: [...(groups[categoryId] || []), field],
      };
    },
    {}
  );

  return FIELD_CATEGORY_ORDER.map((categoryId) => {
    const categoryMeta = FIELD_CATEGORY_META[categoryId];

    return {
      id: categoryId,
      label: categoryMeta.label,
      description: categoryMeta.description,
      fields: groupedFields[categoryId] || [],
    };
  }).filter((category) => category.fields.length > 0);
};

const mapFieldDefinitionsToMeta = (
  definitions?: CertificateFieldDefinition[]
): CertificateFieldMeta[] => {
  if (!definitions?.length) {
    return [];
  }

  return definitions.reduce<CertificateFieldMeta[]>((fields, definition) => {
    const fieldId = String(definition.fieldId || "");

    if (!isCertificateFieldType(fieldId)) {
      return fields;
    }

    const fallbackMeta = getFieldMeta(fieldId);
    const label = definition.value || fallbackMeta.label;

    fields.push({
      id: fieldId,
      label,
      value: fallbackMeta.value,
      exampleValue: definition.value || fallbackMeta.exampleValue,
      icon: getFieldIcon(fieldId),
    });

    return fields;
  }, []);
};

const getFieldDefinitionName = (
  definition?: CertificateFieldDefinition,
  fallbackField?: CertificateField
) => {
  if (definition?.table && definition.key) {
    return `${definition.table}.${definition.key}`;
  }

  if (fallbackField) {
    return getFieldMeta(fallbackField.id).value.replace(/^\{\{|\}\}$/g, "");
  }

  return "";
};

const mapParagraphStyleToApi = (style: CertificateField["paragraphStyle"]) => {
  const paragraphStyles: Record<CertificateField["paragraphStyle"], string> = {
    normal: "normal",
    heading1: "header 1",
    heading2: "header 2",
    heading3: "header 3",
    caption: "caption",
  };

  return paragraphStyles[style];
};

const getSignatureUserId = (
  field: CertificateField,
  definitions: CertificateFieldDefinition[]
) => {
  const ownReferenceId = definitions.find(
    (definition) => definition.fieldId === field.id
  )?.referencesId;
  const fallbackReferenceId =
    field.id === "trainerSignature"
      ? definitions.find(
          (definition) =>
            definition.fieldId === "trainerName" ||
            definition.fieldId === "instructorName"
        )?.referencesId
      : definitions.find((definition) => definition.fieldId === "signature")
          ?.referencesId;
  const userId = Number(ownReferenceId || fallbackReferenceId);

  return Number.isFinite(userId) && userId > 0 ? userId : undefined;
};

const buildCertificateAttributePayload = (
  field: CertificateField,
  templateCertificateId: number,
  definitions: CertificateFieldDefinition[]
): CertificateAttributePayload => {
  const definition = definitions.find((item) => item.fieldId === field.id);
  const fieldName = getFieldDefinitionName(definition, field);
  const coordinatesX = Math.round(field.x);
  const coordinatesY = Math.round(field.y);
  const width = Math.round(getFieldLayoutWidth(field));
  const height = Math.round(getFieldHeight(field));

  if (field.id === "qrCode") {
    return {
      templateCertificateId,
      type: "qr",
      fieldName,
      coordinatesX,
      coordinatesY,
      size: width,
    };
  }

  if (isSignatureField(field.id)) {
    return {
      templateCertificateId,
      type: "sign",
      userId: getSignatureUserId(field, definitions),
      fieldName,
      coordinatesX,
      coordinatesY,
      width,
      height,
    };
  }

  return {
    templateCertificateId,
    type: "text",
    fieldName,
    value: field.isVariable
      ? definition?.value || getFieldMeta(field.id).exampleValue
      : field.value,
    coordinatesX,
    coordinatesY,
    width,
    height,
    fontSize: Math.round(field.fontSize),
    color: field.color,
    font: field.fontFamily || field.font,
    format: field.weight,
    paragraphStyle: mapParagraphStyleToApi(field.paragraphStyle),
    lineHeight: Math.round(field.fontSize * field.lineHeight),
    rotate: Math.round(field.rotate),
    align: field.align,
  };
};

const getFieldDefault = (
  id: CertificateFieldType,
  index: number
): CertificateField => {
  const meta = getFieldMeta(id);
  const width =
    id === "participantName"
      ? 520
      : isSectionField(id) || isAdminField(id) || isModuleField(id)
        ? 360
      : id === "qrCode"
        ? 96
        : id === "trainerSignature" || id === "signatureImage"
          ? 96
          : id === "trainerName" || id === "instructorName"
          ? 220
          : 280;

  return {
    ...getDefaultFieldStyle(id, width),
    instanceId: createFieldInstanceId(id),
    id,
    label: meta.label,
    value: meta.value,
    x: 120 + index * 40,
    y: 160 + index * 48,
    width,
    fontSize:
      id === "qrCode" || id === "trainerSignature" || id === "signatureImage"
        ? 12
        : DEFAULT_TEXT_FONT_SIZE,
    align: "center",
    weight:
      id === "participantName" ? "bold" : id === "qrCode" ? "normal" : "semibold",
  };
};

const getFieldHeight = (
  field: Pick<CertificateField, "id" | "width" | "height"> &
    Partial<Pick<CertificateField, "fontSize" | "lineHeight">>
) =>
  isSignatureField(field.id)
    ? field.height || Math.round(field.width * 0.55)
    : field.id === "qrCode"
      ? field.width
      : field.height || Math.ceil((field.fontSize || 16) * (field.lineHeight || 1.2));

const getFieldLayoutWidth = (
  field: Pick<CertificateField, "id" | "width" | "maxWidth">
) => (field.id === "signature" ? field.maxWidth || field.width : field.width);

const renderVariableText = (value: string) => {
  const parts = value.split(/(\{\{[^{}]+\}\})/g);

  return parts.map((part, index) => {
    const isVariable = /^\{\{[^{}]+\}\}$/.test(part);

    if (!isVariable) {
      return part;
    }

    return (
      <span
        className="rounded-sm bg-sky-100 px-1 font-semibold text-sky-700"
        key={`${part}-${index}`}
      >
        {part}
      </span>
    );
  });
};

const renderParagraphText = (
  value: string,
  isVariable: boolean,
  paragraphSpacing: number
) => {
  const paragraphs = value.split(/\n\s*\n/g);

  return paragraphs.map((paragraph, index) => (
    <span
      className="block"
      key={`${paragraph}-${index}`}
      style={{
        marginBottom: index === paragraphs.length - 1 ? 0 : paragraphSpacing,
      }}
    >
      {isVariable ? renderVariableText(paragraph) : paragraph}
    </span>
  ));
};

const getUniqueFieldsByType = (fields: CertificateField[]) => {
  const fieldTypes = new Set<CertificateFieldType>();

  return fields.filter((field) => {
    if (fieldTypes.has(field.id)) {
      return false;
    }

    fieldTypes.add(field.id);
    return true;
  });
};

const normalizeTemplate = (
  value?: Partial<CertificateTemplate> | null,
  bounds: PdfCoordinatePage = DEFAULT_PAGE_BOUNDS
) => {
  const defaultTemplate = buildDefaultTemplate(bounds);

  if (!value?.fields?.length) {
    return {
      ...defaultTemplate,
      templateName: value?.templateName || defaultTemplate.templateName,
    };
  }

  return {
    templateName: value.templateName || defaultTemplate.templateName,
    page: value.page || defaultTemplate.page,
    canvas: {
      ...defaultTemplate.canvas,
      ...value.canvas,
      width: bounds.width,
      height: bounds.height,
      minX: bounds.minX,
      maxX: bounds.maxX,
      minY: bounds.minY,
      maxY: bounds.maxY,
      previewUrl:
        bounds.previewUrl ||
        bounds.imageUrl ||
        bounds.templateUrl ||
        bounds.url ||
        value.canvas?.previewUrl,
    },
    fields: getUniqueFieldsByType(
      value.fields.map((field, index) => {
        const defaultField = getFieldDefault(field.id, index);

        return {
          ...defaultField,
          ...field,
          instanceId: field.instanceId || createFieldInstanceId(field.id),
          height: field.height || defaultField.height,
          maxWidth: field.maxWidth || field.width || defaultField.width,
          color: field.color || defaultField.color,
          font: field.font || field.fontFamily || defaultField.font,
          fontFamily: field.fontFamily || field.font || defaultField.fontFamily,
          italic:
            typeof field.italic === "boolean"
              ? field.italic
              : defaultField.italic,
          isVariable:
            typeof field.isVariable === "boolean"
              ? field.isVariable
              : hasVariableSyntax(field.value),
          lineHeight: field.lineHeight || defaultField.lineHeight,
          paragraphStyle: field.paragraphStyle || defaultField.paragraphStyle,
          paragraphSpacing:
            field.paragraphSpacing ?? defaultField.paragraphSpacing,
          rotate: field.rotate || defaultField.rotate,
        };
      })
    ),
  };
};

const normalizeApiValue = (value?: string | number | null) =>
  String(value || "").trim().toLowerCase();

const normalizeApiAction = (value?: string | null) => {
  const action = normalizeApiValue(value);

  return action === "genereate" ? "generate" : action;
};

const normalizeApiType = (value?: string | null) => {
  const type = normalizeApiValue(value);

  if (type === "qrcode") {
    return "qr";
  }

  return type;
};

const normalizeFieldLineHeight = (
  value: unknown,
  fontSize: number,
  fallback: number
) => {
  const lineHeight = Number(value);

  if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
    return fallback;
  }

  if (lineHeight > 4) {
    return Number((lineHeight / Math.max(fontSize, 1)).toFixed(2));
  }

  return lineHeight;
};

const getAttributeFieldId = (
  attribute: CertificateTemplateAttribute,
  definitions: CertificateFieldDefinition[] = []
): CertificateFieldType | null => {
  const matchedDefinition = getAttributeFieldDefinition(attribute, definitions);
  const matchedDefinitionFieldId = String(matchedDefinition?.fieldId || "");

  if (isCertificateFieldType(matchedDefinitionFieldId)) {
    return matchedDefinitionFieldId;
  }

  const tableKey = [attribute.tableName, attribute.table, attribute.key]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(".");
  const fieldIdByApiKey: Record<string, CertificateFieldType> = {
    "userclass.name": "participantName",
    "class.name": "trainingName",
    "certificate.certificatenumber": "certificateId",
    "certificate.issueddate": "issuedDate",
    "certificate.certificatekode": "qrCode",
    "usercertificarte.certificatekode": "qrCode",
    "usercertificate.certificatekode": "qrCode",
    "module.name": "trainingName",
    "instructor.name": "instructorName",
  };
  const fieldIdByKey: Record<string, CertificateFieldType> = {
    name: "participantName",
    certificatenumber: "certificateId",
    issueddate: "issuedDate",
    certificatekode: "qrCode",
  };
  const fieldIdFromApiKey =
    fieldIdByApiKey[tableKey] ||
    fieldIdByKey[String(attribute.key || "").toLowerCase()];

  if (fieldIdFromApiKey) {
    return fieldIdFromApiKey;
  }

  if (String(attribute.type || "").toLowerCase() === "qr") {
    return "qrCode";
  }

  const rawId =
    attribute.fieldType ||
    attribute.fieldId ||
    attribute.type ||
    attribute.key ||
    attribute.name ||
    attribute.variable;

  if (!rawId) {
    return null;
  }

  const normalizedId = String(rawId).replace(/^\{\{|\}\}$/g, "");

  if (/^section_\d+$/.test(normalizedId)) {
    return normalizedId.replace("section_", "section-") as CertificateFieldType;
  }

  if (/^admin_\d+$/.test(normalizedId)) {
    return normalizedId.replace("admin_", "admin-") as CertificateFieldType;
  }

  if (/^module_\d+$/.test(normalizedId)) {
    return normalizedId.replace("module_", "module-") as CertificateFieldType;
  }

  if (/^module-\d+$/.test(normalizedId)) {
    return normalizedId as CertificateFieldType;
  }

  const matchedField = FIELD_META.find(
    (field) =>
      field.id === normalizedId ||
      field.value.replace(/^\{\{|\}\}$/g, "") === normalizedId
  );

  return matchedField?.id || null;
};

const getAttributeFieldDefinition = (
  attribute: CertificateTemplateAttribute,
  definitions: CertificateFieldDefinition[] = []
) => {
  const attributeTable = normalizeApiValue(attribute.tableName || attribute.table);
  const attributeKey = normalizeApiValue(attribute.key);
  const attributeAction = normalizeApiAction(attribute.action);
  const attributeType = normalizeApiType(attribute.type);
  const attributeReferenceId = normalizeApiValue(
    attribute.referencesDataId || attribute.referencesId
  );

  return definitions.find((definition) => {
    const sameTable =
      !attributeTable || normalizeApiValue(definition.table) === attributeTable;
    const sameKey =
      !attributeKey || normalizeApiValue(definition.key) === attributeKey;
    const sameAction =
      !attributeAction ||
      normalizeApiAction(definition.action) === attributeAction;
    const sameType =
      !attributeType || normalizeApiType(definition.type) === attributeType;
    const definitionReferenceId = normalizeApiValue(definition.referencesId);
    const sameReference =
      !attributeReferenceId ||
      !definitionReferenceId ||
      definitionReferenceId === attributeReferenceId;

    return sameTable && sameKey && sameAction && sameType && sameReference;
  });
};

const mapCertificateAttributesToMeta = (
  certificate?: CertificateDetail | null,
  definitions: CertificateFieldDefinition[] = []
): CertificateFieldMeta[] => {
  const attributes =
    certificate?.templateCertificate?.flatMap(
      (template) => template.certificateAttributes || []
    ) || [];

  return attributes.reduce<CertificateFieldMeta[]>((fields, attribute) => {
    const fieldId = getAttributeFieldId(attribute, definitions);

    if (!fieldId || fields.some((field) => field.id === fieldId)) {
      return fields;
    }

    const definition = getAttributeFieldDefinition(attribute, definitions);
    const fallbackMeta = getFieldMeta(fieldId);
    const label =
      definition?.value ||
      attribute.label ||
      attribute.title ||
      attribute.value ||
      fallbackMeta.label;

    fields.push({
      id: fieldId,
      label,
      value: fallbackMeta.value,
      exampleValue: definition?.value || attribute.value || fallbackMeta.exampleValue,
      icon: getFieldIcon(fieldId),
    });

    return fields;
  }, []);
};

const mergeCertificateFieldMetas = (
  ...groups: CertificateFieldMeta[][]
): CertificateFieldMeta[] => {
  const fieldMetasById = new Map<CertificateFieldType, CertificateFieldMeta>();

  groups.flat().forEach((field) => {
    fieldMetasById.set(field.id, field);
  });

  return Array.from(fieldMetasById.values());
};

const mapCertificateAttributesToFields = (
  attributes: CertificateTemplateAttribute[] | undefined,
  bounds: PdfCoordinatePage,
  definitions: CertificateFieldDefinition[] = []
) => {
  if (!attributes?.length) {
    return [];
  }

  return attributes
    .map((attribute, index) => {
      const definition = getAttributeFieldDefinition(attribute, definitions);
      const fieldId = getAttributeFieldId(attribute, definitions);

      if (!fieldId) {
        return null;
      }

      const defaultField = getFieldDefault(fieldId, index);
      const textProperties = attribute.textProperties || {};
      const format = String(textProperties.format || attribute.format || "");
      const isApiVariableField = Boolean(
        attribute.action || attribute.tableName || attribute.table || attribute.key
      );
      const isVariable =
        typeof attribute.isVariable === "boolean"
          ? attribute.isVariable
          : isApiVariableField || hasVariableSyntax(attribute.value || attribute.variable || "");
      const isItalic = format.toLowerCase().includes("italic");
      const weight = format.toLowerCase().includes("bold")
        ? "bold"
        : format.toLowerCase().includes("semibold")
          ? "semibold"
          : defaultField.weight;
      const width =
        attribute.width ??
        attribute.sizeX ??
        attribute.maxWidth ??
        (fieldId === "qrCode" ? attribute.size : undefined) ??
        defaultField.width;
      const height =
        attribute.height ??
        attribute.sizeY ??
        (fieldId === "qrCode" ? attribute.size : undefined) ??
        defaultField.height;
      const fontSize = Number(
        attribute.fontSize ?? attribute.size ?? defaultField.fontSize
      );
      const lineHeight = normalizeFieldLineHeight(
        textProperties.lineHeight ?? attribute.lineHeight,
        fontSize,
        defaultField.lineHeight
      );

      return {
        ...defaultField,
        instanceId:
          attribute.instanceId ||
          attribute.id?.toString() ||
          createFieldInstanceId(fieldId),
        label:
          definition?.value ||
          attribute.label ||
          attribute.title ||
          defaultField.label,
        value: isVariable
          ? getFieldVariableValue(fieldId)
          : definition?.value ||
            attribute.value ||
            attribute.variable ||
            attribute.text ||
            defaultField.value,
        x: Number(
          attribute.x ?? attribute.positionX ?? attribute.coordinatesX ?? defaultField.x
        ),
        y: Number(
          attribute.y ?? attribute.positionY ?? attribute.coordinatesY ?? defaultField.y
        ),
        width: Number(width),
        height: Number(height),
        maxWidth: Number(
          attribute.maxWidth ??
            attribute.width ??
            attribute.sizeX ??
            (fieldId === "qrCode" ? attribute.size : undefined) ??
            defaultField.maxWidth
        ),
        fontSize,
        color: textProperties.color || attribute.color || defaultField.color,
        font: textProperties.font || attribute.font || defaultField.font,
        fontFamily:
          textProperties.font || attribute.fontFamily || defaultField.fontFamily,
        align: textProperties.align || attribute.align || defaultField.align,
        weight: attribute.weight || weight,
        italic:
          typeof attribute.italic === "boolean"
            ? attribute.italic
            : isItalic || defaultField.italic,
        rotate: Number(attribute.rotate ?? defaultField.rotate),
        isVariable,
        lineHeight,
        paragraphStyle:
          textProperties.paragraphStyle ||
          attribute.paragraphStyle ||
          defaultField.paragraphStyle,
        paragraphSpacing: Number(
          attribute.paragraphSpacing ?? defaultField.paragraphSpacing
        ),
      } satisfies CertificateField;
    })
    .filter(Boolean) as CertificateField[];
};

const getCertificateBounds = (
  certificate?: CertificateDetail | null,
  definitions: CertificateFieldDefinition[] = []
): PdfCoordinateBounds | null => {
  const pages = certificate?.templateCertificate;

  if (!pages?.length) {
    return null;
  }

  const sortedPages = [...pages].sort((a, b) => a.id - b.id);
  const firstPage = sortedPages[0];

  return {
    templateName: firstPage.fileName.split("/").pop() || CERTIFICATE_TEMPLATE_NAME,
    templatePath: firstPage.fileName,
    totalPages: sortedPages.length,
    pages: sortedPages.map((page, index) => {
      const templateUrl = page.presignedUrl || page.fileUrl;
      const bounds: PdfCoordinatePage = {
        page: index + 1,
        templateId: page.id,
        width: page.maxSizeX || DEFAULT_PAGE_BOUNDS.width,
        height: page.maxSizeY || DEFAULT_PAGE_BOUNDS.height,
        minX: 0,
        maxX: page.maxSizeX || DEFAULT_PAGE_BOUNDS.maxX,
        minY: 0,
        maxY: page.maxSizeY || DEFAULT_PAGE_BOUNDS.maxY,
        previewUrl: templateUrl,
        templateUrl,
        url: templateUrl,
      };

      return {
        ...bounds,
        fields: mapCertificateAttributesToFields(
          page.certificateAttributes,
          bounds,
          definitions
        ),
      };
    }),
    previewUrl: firstPage.presignedUrl || firstPage.fileUrl,
    templateUrl: firstPage.presignedUrl || firstPage.fileUrl,
    url: firstPage.presignedUrl || firstPage.fileUrl,
  };
};

const getCertificateTemplate = (
  bounds?: PdfCoordinateBounds | null
): Partial<CertificateTemplate> | null => {
  const firstPage = bounds?.pages?.[0];

  if (!firstPage) {
    return null;
  }

  return {
    templateName: bounds.templateName,
    page: firstPage.page,
    canvas: {
      width: firstPage.width,
      height: firstPage.height,
      minX: firstPage.minX,
      maxX: firstPage.maxX,
      minY: firstPage.minY,
      maxY: firstPage.maxY,
      previewUrl: firstPage.previewUrl,
      backgroundColor: "#ffffff",
    },
    fields: firstPage.fields?.length ? firstPage.fields : undefined,
  };
};

type CertificateCanvasFieldProps = {
  field: CertificateField;
  canvas: CertificateTemplate["canvas"];
  isSelected: boolean;
  onContextMenu: (field: CertificateField, x: number, y: number) => void;
  onResize: (
    instanceId: string,
    updates: Pick<CertificateField, "height" | "maxWidth" | "width"> &
      Partial<Pick<CertificateField, "fontSize" | "y">>
  ) => void;
  onSelect: (instanceId: string) => void;
};

const CertificateCanvasField = ({
  field,
  canvas,
  isSelected,
  onContextMenu,
  onResize,
  onSelect,
}: CertificateCanvasFieldProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: field.instanceId,
    });
  const fieldRef = useRef<HTMLButtonElement | null>(null);
  const coordinateWidth = canvas.maxX - canvas.minX || canvas.width;
  const coordinateHeight = canvas.maxY - canvas.minY || canvas.height;
  const translate = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : "";
  const rotate = field.rotate ? `rotate(${field.rotate}deg)` : "";
  const fieldMaxWidth = field.maxWidth || field.width;
  const fieldHeight = getFieldHeight(field);
  const fieldLayoutWidth = getFieldLayoutWidth(field);
  const setFieldNodeRef = useCallback(
    (node: HTMLButtonElement | null) => {
      fieldRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );
  const handleFieldResizeStart = (
    event: ReactPointerEvent<HTMLSpanElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(field.instanceId);

    const canvasElement = fieldRef.current?.parentElement;
    const canvasRect = canvasElement?.getBoundingClientRect();

    if (!canvasRect) {
      return;
    }

    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startWidth = field.width;
    const startHeight = getFieldHeight(field);
    const startY = field.y;
    const startFontSize = field.fontSize;
    const maxWidth = Math.max(40, canvas.maxX - field.x);
    const maxHeight = Math.max(24, canvas.maxY - field.y);
    const minWidth = field.id === "qrCode" || isSignatureField(field.id) ? 40 : 80;
    const minHeight = field.id === "qrCode" ? 40 : isSignatureField(field.id) ? 24 : 20;
    const isTextField = field.id !== "qrCode" && !isSignatureField(field.id);
    const getTextRequiredHeight = (fontSize: number, width: number) => {
      const lineHeight = Math.max(field.lineHeight || 1.2, 1);
      const cssWidth = (width / coordinateWidth) * canvasRect.width;
      const availableTextWidth = Math.max(cssWidth - 16, 1);
      const averageCharacterWidth = Math.max(fontSize * 0.55, 1);
      const explicitLines = field.value.split("\n");
      const wrappedLineCount = explicitLines.reduce((total, line) => {
        const estimatedLineWidth = line.length * averageCharacterWidth;
        return (
          total +
          Math.max(1, Math.ceil(estimatedLineWidth / availableTextWidth))
        );
      }, 0);
      const requiredCssHeight = Math.ceil(
        wrappedLineCount * fontSize * lineHeight + 12
      );

      return Math.ceil((requiredCssHeight / canvasRect.height) * coordinateHeight);
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX =
        ((moveEvent.clientX - startClientX) / canvasRect.width) *
        coordinateWidth;
      const deltaY =
        ((moveEvent.clientY - startClientY) / canvasRect.height) *
        coordinateHeight;
      const nextWidth = Math.round(
        Math.max(minWidth, Math.min(startWidth + deltaX, maxWidth))
      );
      let nextHeight = Math.round(
        Math.max(minHeight, Math.min(startHeight + deltaY, maxHeight))
      );
      const hasVerticalResize = Math.abs(deltaY) > 2;
      const heightScale = nextHeight / Math.max(startHeight, 1);
      const maxFontSizeByHeight = Math.max(
        8,
        Math.floor(nextHeight / Math.max(field.lineHeight || 1.2, 1))
      );
      const nextFontSize = Math.round(
        hasVerticalResize && isTextField
          ? Math.max(
              8,
              Math.min(startFontSize * heightScale, maxFontSizeByHeight, 96)
            )
          : startFontSize
      );

      if (isTextField) {
        nextHeight = Math.round(
          Math.max(
            nextHeight,
            Math.min(getTextRequiredHeight(nextFontSize, nextWidth), maxHeight)
          )
        );
      }

      onResize(field.instanceId, {
        ...(isTextField ? { fontSize: nextFontSize } : {}),
        height: nextHeight,
        maxWidth: nextWidth,
        width: nextWidth,
        y: Math.max(canvas.minY, startY - Math.max(nextHeight - startHeight, 0)),
      });
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <button
      {...attributes}
      {...listeners}
      className={cn(
        "absolute z-10 cursor-grab touch-none select-none rounded-sm border border-transparent px-2 py-1 text-left active:cursor-grabbing",
        isSelected && "border-primary bg-primary/10",
        isDragging && "z-20 shadow-sm"
      )}
      data-field-id={field.id}
      data-field-instance-id={field.instanceId}
      key={field.instanceId}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(field.instanceId);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect(field.instanceId);
        onContextMenu(field, event.clientX, event.clientY);
      }}
      ref={setFieldNodeRef}
      style={{
        left: `${((field.x - canvas.minX) / coordinateWidth) * 100}%`,
        top: `${
          ((canvas.maxY - field.y - fieldHeight) / coordinateHeight) * 100
        }%`,
        width: `${(fieldLayoutWidth / coordinateWidth) * 100}%`,
        maxWidth: `${(fieldMaxWidth / coordinateWidth) * 100}%`,
        height: `${(fieldHeight / coordinateHeight) * 100}%`,
        fontSize: `${field.fontSize}px`,
        color: field.color,
        fontFamily: field.fontFamily || field.font,
        lineHeight: field.lineHeight,
        fontStyle: field.italic ? "italic" : "normal",
        fontWeight:
          field.weight === "bold" ? 700 : field.weight === "semibold" ? 600 : 400,
        textAlign: field.align,
        transform: `${translate} ${rotate}`.trim() || undefined,
        transformOrigin: "center",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
      }}
      type="button"
    >
      {field.id === "qrCode" ? (
        <span className="flex h-full w-full items-center justify-center border-2 border-slate-950 bg-white text-base font-bold text-slate-950">
          QR
        </span>
      ) : isSignatureField(field.id) ? (
        <span className="flex h-full w-full items-center justify-center border-2 border-dashed border-slate-950 bg-white text-xs font-semibold uppercase text-slate-950">
          TTD
        </span>
      ) : (
        <span className="block h-full w-full overflow-hidden">
          {renderParagraphText(
            field.value,
            field.isVariable,
            field.paragraphSpacing
          )}
        </span>
      )}
      {isSelected ? (
        <span
          aria-label="Resize field"
          className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-primary bg-background shadow-sm"
          onPointerDown={handleFieldResizeStart}
          role="button"
          tabIndex={-1}
        />
      ) : null}
    </button>
  );
};

export const CertificateTemplateEditor = ({
  classId,
  certificateId,
}: Props) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const { hideSidebar, setHideSidebar } = useDashboardContext();
  const previousHideSidebarRef = useRef(hideSidebar);
  const isSwitchingPageRef = useRef(false);
  const [template, setTemplate] =
    useState<CertificateTemplate>(DEFAULT_TEMPLATE);
  const [selectedFieldInstanceId, setSelectedFieldInstanceId] = useState(
    DEFAULT_TEMPLATE.fields[0]?.instanceId || ""
  );
  const [dragFieldId, setDragFieldId] = useState<CertificateFieldType | null>(
    null
  );
  const [fieldContextMenu, setFieldContextMenu] =
    useState<FieldContextMenu>(null);
  const [certificateDetail, setCertificateDetail] =
    useState<CertificateDetail | null>(null);
  const [certificateFieldMetas, setCertificateFieldMetas] = useState<
    CertificateFieldMeta[]
  >([]);
  const [certificateFieldDefinitions, setCertificateFieldDefinitions] =
    useState<CertificateFieldDefinition[]>([]);
  const [moduleTitle, setModuleTitle] = useState("Template Sertifikat");
  const [pdfBounds, setPdfBounds] =
    useState<PdfCoordinateBounds | null>(null);
  const [selectedPage, setSelectedPage] = useState(DEFAULT_PAGE_BOUNDS.page);
  const [pageFields, setPageFields] = useState<Record<number, CertificateField[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState("");
  const [uploadTarget, setUploadTarget] =
    useState<CertificateTemplateUploadTarget | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const selectedField = useMemo(
    () =>
      template.fields.find(
        (field) => field.instanceId === selectedFieldInstanceId
      ) || null,
    [template.fields, selectedFieldInstanceId]
  );

  const allCertificateFieldMetas = useMemo(
    () =>
      mergeCertificateFieldMetas(
        certificateFieldMetas,
        mapCertificateAttributesToMeta(certificateDetail, certificateFieldDefinitions)
      ),
    [certificateDetail, certificateFieldDefinitions, certificateFieldMetas]
  );

  const availableFields = useMemo<CertificateFieldMeta[]>(() => {
    const classData = certificateDetail?.module?.class;
    const moduleData = certificateDetail?.module;
    const apiFieldMetasById = new Map(
      allCertificateFieldMetas.map((field) => [field.id, field])
    );
    const defaultFields = FIELD_META.map(
      (field) => apiFieldMetasById.get(field.id) || field
    );
    const additionalApiFields = allCertificateFieldMetas.filter(
      (field) => !FIELD_META.some((defaultField) => defaultField.id === field.id)
    );
    const sectionFields =
      classData?.sections
        ?.slice()
        .sort((first, second) => (first.position || 0) - (second.position || 0))
        .map((section) => {
          const label = section.title || section.name || `Section ${section.id}`;

          return {
            id: `section-${section.id}` as CertificateFieldType,
            label,
            value: `{{section_${section.id}}}`,
            exampleValue: label,
            icon: <Type className="h-4 w-4" />,
        };
      }) || [];
    const moduleFields = moduleData?.id
      ? [
          {
            id: `module-${moduleData.id}` as CertificateFieldType,
            label:
              moduleData.title ||
              moduleData.name ||
              `Module ${moduleData.id}`,
            value: `{{module_${moduleData.id}}}`,
            exampleValue:
              moduleData.title ||
              moduleData.name ||
              `Module ${moduleData.id}`,
            icon: <Type className="h-4 w-4" />,
          },
        ]
      : [];
    const adminFields =
      classData?.admins?.map((admin) => {
        const label = admin.user?.name || `Admin ${admin.id}`;

        return {
          id: `admin-${admin.id}` as CertificateFieldType,
          label,
          value: `{{admin_${admin.id}}}`,
          exampleValue: label,
          icon: <UserRound className="h-4 w-4" />,
        };
      }) || [];

    return [
      ...defaultFields,
      ...additionalApiFields,
      ...sectionFields,
      ...adminFields,
      ...moduleFields,
    ];
  }, [allCertificateFieldMetas, certificateDetail]);

  const fieldCategories = useMemo(
    () => groupCertificateFields(availableFields),
    [availableFields]
  );

  const getFieldDisplayValue = useCallback(
    (id: CertificateFieldType) => {
      const certificateFieldMeta = allCertificateFieldMetas.find(
        (field) => field.id === id
      );

      if (certificateFieldMeta?.exampleValue) {
        return certificateFieldMeta.exampleValue;
      }

      const classData = certificateDetail?.module?.class;
      const moduleData = certificateDetail?.module;
      const className = classData?.title || classData?.name;
      const instructorName = classData?.instructor?.user?.name;

      if (id === "trainingName" && className) {
        return className;
      }

      if (isSectionField(id)) {
        const sectionId = Number(id.replace("section-", ""));
        const section = classData?.sections?.find((item) => item.id === sectionId);

        return section?.title || section?.name || getFieldExampleValue(id);
      }

      if (isAdminField(id)) {
        const adminId = Number(id.replace("admin-", ""));
        const admin = classData?.admins?.find((item) => item.id === adminId);

        return admin?.user?.name || getFieldExampleValue(id);
      }

      if (isModuleField(id)) {
        const moduleId = Number(id.replace("module-", ""));

        if (moduleData?.id === moduleId) {
          return moduleData.title || moduleData.name || getFieldExampleValue(id);
        }
      }

      if (
        (id === "instructorName" || id === "trainerName") &&
        instructorName
      ) {
        return instructorName;
      }

      return getFieldExampleValue(id);
    },
    [allCertificateFieldMetas, certificateDetail]
  );

  const updateField = useCallback((
    instanceId: string,
    updates: Partial<CertificateField>
  ) => {
    setTemplate((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.instanceId === instanceId ? { ...field, ...updates } : field
      ),
    }));
  }, []);
  const getCoordinateWidth = useCallback(
    () => template.canvas.maxX - template.canvas.minX || template.canvas.width,
    [template.canvas.maxX, template.canvas.minX, template.canvas.width]
  );
  const getCoordinateHeight = useCallback(
    () => template.canvas.maxY - template.canvas.minY || template.canvas.height,
    [template.canvas.maxY, template.canvas.minY, template.canvas.height]
  );
  const clampFieldPosition = useCallback((
    field: Pick<CertificateField, "id" | "width" | "height" | "maxWidth">,
    x: number,
    y: number
  ) => ({
    x: Math.max(
      template.canvas.minX,
      Math.min(
        x,
        Math.max(
          template.canvas.maxX - getFieldLayoutWidth(field),
          template.canvas.minX
        )
      )
    ),
    y: Math.max(
      template.canvas.minY,
      Math.min(
        y,
        Math.max(template.canvas.maxY - getFieldHeight(field), template.canvas.minY)
      )
    ),
  }), [
    template.canvas.maxX,
    template.canvas.maxY,
    template.canvas.minX,
    template.canvas.minY,
  ]);
  const addField = (id: CertificateFieldType, meta?: CertificateFieldMeta) => {
    const existingField = template.fields.find((field) => field.id === id);

    if (existingField) {
      setSelectedFieldInstanceId(existingField.instanceId);
      setFieldContextMenu(null);
      return;
    }

    const nextField = getFieldDefault(id, template.fields.length);
    const centeredPosition = clampFieldPosition(
      nextField,
      template.canvas.minX +
        (getCoordinateWidth() - getFieldLayoutWidth(nextField)) / 2,
      template.canvas.minY +
        (getCoordinateHeight() - getFieldHeight(nextField)) / 2
    );
    const fieldToAdd = meta
      ? {
          ...nextField,
          label: meta.label,
          value: meta.value,
          x: centeredPosition.x,
          y: centeredPosition.y,
        }
      : {
          ...nextField,
          x: centeredPosition.x,
          y: centeredPosition.y,
        };
    const nextFields = [...template.fields, fieldToAdd];

    setTemplate((current) => {
      return {
        ...current,
        fields: nextFields,
      };
    });
    setPageFields((current) => ({
      ...current,
      [selectedPage]: nextFields,
    }));
    setSelectedFieldInstanceId(fieldToAdd.instanceId);
    setFieldContextMenu(null);
  };

  const deleteField = (instanceId: string) => {
    setTemplate((current) => {
      const nextFields = current.fields.filter(
        (field) => field.instanceId !== instanceId
      );

      if (selectedFieldInstanceId === instanceId) {
        setSelectedFieldInstanceId(nextFields[0]?.instanceId || "");
      }

      return {
        ...current,
        fields: nextFields,
      };
    });
    setFieldContextMenu(null);
  };

  const applyPageBounds = (bounds: PdfCoordinatePage) => {
    isSwitchingPageRef.current = true;
    const nextPageFields = {
      ...pageFields,
      [selectedPage]: template.fields,
    };
    const defaultTemplate = buildDefaultTemplate(bounds);
    const hasSavedTargetFields = Object.prototype.hasOwnProperty.call(
      nextPageFields,
      bounds.page
    );
    const targetFields = hasSavedTargetFields
      ? nextPageFields[bounds.page]
      : bounds.fields || [];
    const normalizedTargetFields = targetFields.map((field) => ({
      ...field,
      x: Math.max(
        bounds.minX,
        Math.min(
          field.x,
          Math.max(bounds.maxX - getFieldLayoutWidth(field), bounds.minX)
        )
      ),
      y: Math.max(
        bounds.minY,
        Math.min(
          field.y,
          Math.max(bounds.maxY - getFieldHeight(field), bounds.minY)
        )
      ),
    }));

    setPageFields({
      ...nextPageFields,
      [bounds.page]: normalizedTargetFields,
    });
    setSelectedPage(bounds.page);
    setTemplate((current) => ({
      ...current,
      templateName: pdfBounds?.templateName || current.templateName,
      page: bounds.page,
      canvas: defaultTemplate.canvas,
      fields: normalizedTargetFields,
    }));
    setSelectedFieldInstanceId(normalizedTargetFields[0]?.instanceId || "");
    setFieldContextMenu(null);
  };

  const fetchPdfBounds = useCallback(async (templateName: string) => {
    const boundsResponse: ApiResponse<PdfCoordinateBounds> = await fetchApi(
      `/pdf-lib/coordinate-bounds?templateName=${encodeURIComponent(
        templateName
      )}`
    );
    const boundsData =
      boundsResponse?.statusCode === 200 ? boundsResponse.data : null;

    if (!boundsData) {
      toast.error(
        boundsResponse?.message || "Gagal mengambil coordinate bounds template PDF"
      );
      return {
        templateName,
        templatePath: boundsResponse.data?.templatePath || "",
        totalPages: 1,
        pages: [DEFAULT_PAGE_BOUNDS],
      };
    }

    return withTemplatePreviewUrls(boundsData);
  }, []);

  const loadTemplate = useCallback(async () => {
    setIsLoading(true);

    try {
      const [
        response,
        fieldResponse,
      ]: [
        ApiResponse<CertificateDetail>,
        ApiResponse<CertificateFieldDefinitionResponse>,
      ] = await Promise.all([
        fetchApi<ApiResponse<CertificateDetail>>(
          `/certificate/template/${certificateId}`
        ),
        fetchApi<ApiResponse<CertificateFieldDefinitionResponse>>(
          `/certificate/field/${certificateId}`
        ),
      ]);
      let certificateTemplate: Partial<CertificateTemplate> | null = null;
      let certificateBounds: PdfCoordinateBounds | null = null;
      let fieldDefinitions: CertificateFieldDefinition[] = [];

      if (fieldResponse?.statusCode === 200 && fieldResponse.data) {
        fieldDefinitions = fieldResponse.data.fields || [];

        setCertificateFieldDefinitions(fieldDefinitions);
      } else {
        setCertificateFieldDefinitions([]);
      }

      if (response?.statusCode === 200 && response.data) {
        const certificateData = response.data;
        const fieldMetasFromDefinitions =
          mapFieldDefinitionsToMeta(fieldDefinitions);
        const fieldMetasFromTemplate =
          mapCertificateAttributesToMeta(certificateData, fieldDefinitions);

        setCertificateDetail(certificateData);
        setCertificateFieldMetas(
          mergeCertificateFieldMetas(
            fieldMetasFromDefinitions,
            fieldMetasFromTemplate
          )
        );
        certificateBounds = getCertificateBounds(certificateData, fieldDefinitions);
        certificateTemplate = getCertificateTemplate(certificateBounds);
        setUploadTarget({
          classId: certificateData.module?.class?.id || Number(classId),
          sectionId: certificateData.module?.section?.id || 0,
          moduleId: certificateData.moduleId || certificateData.module?.id || 0,
        });
        setModuleTitle(certificateData.module?.name || "Template Sertifikat");
      } else {
        setCertificateDetail(null);
        setCertificateFieldMetas(mapFieldDefinitionsToMeta(fieldDefinitions));
        setUploadTarget(null);
        toast.error(response?.message || "Gagal mengambil data sertifikat");
      }

      const templateName =
        certificateTemplate?.templateName ||
        certificateBounds?.templateName ||
        CERTIFICATE_TEMPLATE_NAME;
      const boundsData =
        response?.statusCode === 200 && response.data && !certificateBounds
          ? {
              templateName,
              templatePath: "",
              totalPages: 1,
              pages: [DEFAULT_PAGE_BOUNDS],
            }
          : certificateBounds || (await fetchPdfBounds(templateName));
      const firstPageBounds = boundsData.pages?.[0] || DEFAULT_PAGE_BOUNDS;
      const initialPageFields = boundsData.pages.reduce<
        Record<number, CertificateField[]>
      >((fieldsByPage, page) => {
        fieldsByPage[page.page] = page.fields || [];
        return fieldsByPage;
      }, {});

      setPdfBounds(boundsData);
      setPageFields(initialPageFields);
      setSelectedPage(firstPageBounds.page);
      const loadedTemplate =
        response?.statusCode === 200 && response.data
          ? normalizeTemplate(certificateTemplate, firstPageBounds)
          : buildDefaultTemplate(firstPageBounds);
      setTemplate(loadedTemplate);
      setSelectedFieldInstanceId(loadedTemplate.fields[0]?.instanceId || "");
    } finally {
      setIsLoading(false);
    }
  }, [certificateId, classId, fetchPdfBounds]);

  const handleUploadPdf = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("File harus berupa PDF");
      return;
    }

    if (
      !uploadTarget?.classId ||
      !uploadTarget.sectionId ||
      !uploadTarget.moduleId
    ) {
      toast.error("Data kelas, section, atau modul sertifikat belum lengkap");
      return;
    }

    setIsUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse: ApiResponse = await fetchApi(
        `/certificate/${uploadTarget.classId}/${uploadTarget.sectionId}/${uploadTarget.moduleId}/template`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (
        uploadResponse?.statusCode !== 200 &&
        uploadResponse?.statusCode !== 201
      ) {
        toast.error(uploadResponse?.message || "Gagal upload template PDF");
        return;
      }

      const templateName = getUploadedTemplateName(uploadResponse, file.name);
      const boundsData = await fetchPdfBounds(templateName);
      const firstPageBounds = boundsData.pages?.[0] || DEFAULT_PAGE_BOUNDS;
      const nextCanvas = buildDefaultTemplate(firstPageBounds).canvas;

      setPdfBounds(boundsData);
      setSelectedPage(firstPageBounds.page);
      setUploadedPdfName(templateName);
      setTemplate((current) => ({
        ...current,
        templateName,
        page: firstPageBounds.page,
        canvas: nextCanvas,
        fields: current.fields.map((field) => ({
          ...field,
          x: Math.max(
            firstPageBounds.minX,
            Math.min(
              field.x,
              Math.max(
                firstPageBounds.maxX - getFieldLayoutWidth(field),
                firstPageBounds.minX
              )
            )
          ),
          y: Math.max(
            firstPageBounds.minY,
            Math.min(
              field.y,
              Math.max(
                firstPageBounds.maxY - getFieldHeight(field),
                firstPageBounds.minY
              )
            )
          ),
        })),
      }));
      setFieldContextMenu(null);
      toast.success("Template PDF berhasil di-upload");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    const fieldId =
      dragFieldId ||
      (event.dataTransfer.getData("certificate-field") as CertificateFieldType);

    if (!canvas || !fieldId) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const coordinateWidth = getCoordinateWidth();
    const coordinateHeight = getCoordinateHeight();
    const existingField = template.fields.find((field) => field.id === fieldId);
    const draggedLabel = event.dataTransfer.getData("certificate-field-label");
    const draggedValue = event.dataTransfer.getData("certificate-field-value");
    const newFieldBase = getFieldDefault(fieldId, template.fields.length);
    const newField = {
      ...newFieldBase,
      label: draggedLabel || newFieldBase.label,
      value: draggedValue || newFieldBase.value,
    };
    const targetField = existingField || newField;
    const fieldWidth = getFieldLayoutWidth(targetField);
    const fieldHeight = getFieldHeight(targetField);
    const point = {
      x:
        template.canvas.minX +
        ((event.clientX - rect.left) / rect.width) * coordinateWidth,
      y:
        template.canvas.maxY -
        ((event.clientY - rect.top) / rect.height) * coordinateHeight,
    };
    const nextPosition = clampFieldPosition(
      {
        id: targetField.id,
        width: targetField.width,
        height: targetField.height,
        maxWidth: targetField.maxWidth,
      },
      point.x - fieldWidth / 2,
      point.y - fieldHeight / 2
    );

    setTemplate((current) => {
      if (existingField) {
        return {
          ...current,
          fields: current.fields.map((field) =>
            field.instanceId === existingField.instanceId
              ? { ...field, x: nextPosition.x, y: nextPosition.y }
              : field
          ),
        };
      }

      return {
        ...current,
        fields: [
          ...current.fields,
          { ...newField, x: nextPosition.x, y: nextPosition.y },
        ],
      };
    });
    setSelectedFieldInstanceId(
      existingField ? existingField.instanceId : newField.instanceId
    );
    setFieldContextMenu(null);
    setDragFieldId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const fieldsByPage = {
        ...pageFields,
        [selectedPage]: template.fields,
      };

      if (!pdfBounds?.pages?.length) {
        toast.error("Template PDF belum tersedia");
        return;
      }

      const attributePayloads = pdfBounds.pages.flatMap((page) => {
        if (!page.templateId) {
          return [];
        }

        return (fieldsByPage[page.page] || page.fields || []).map((field) =>
          buildCertificateAttributePayload(
            field,
            page.templateId as number,
            certificateFieldDefinitions
          )
        );
      });

      if (!attributePayloads.length) {
        toast.error("Belum ada field sertifikat yang bisa disimpan");
        return;
      }

      const responses = await Promise.all(
        attributePayloads.map((payload) =>
          fetchApi<ApiResponse>("/certificate/attribute", {
            method: "POST",
            body: payload,
          })
        )
      );
      const failedResponse = responses.find(
        (response) => response?.statusCode !== 200 && response?.statusCode !== 201
      );

      if (!failedResponse) {
        toast.info("Template sertifikat sudah disimpan");
      } else {
        toast.error(
          failedResponse?.message || "Gagal menyimpan template sertifikat"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setSelectedFieldInstanceId(String(event.active.id));
    setFieldContextMenu(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const instanceId = String(event.active.id);
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const coordinateWidth = getCoordinateWidth();
    const coordinateHeight = getCoordinateHeight();
    const deltaX = (event.delta.x / rect.width) * coordinateWidth;
    const deltaY = (event.delta.y / rect.height) * coordinateHeight;

    setTemplate((current) => ({
      ...current,
      fields: current.fields.map((field) => {
        if (field.instanceId !== instanceId) {
          return field;
        }

        const nextPosition = {
          x: field.x + deltaX,
          y: field.y - deltaY,
        };

        return {
          ...field,
          ...clampFieldPosition(field, nextPosition.x, nextPosition.y),
        };
      }),
    }));
  };

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  useEffect(() => {
    if (isSwitchingPageRef.current) {
      isSwitchingPageRef.current = false;
      return;
    }

    setPageFields((current) => ({
      ...current,
      [selectedPage]: template.fields,
    }));
  }, [selectedPage, template.fields]);

  useEffect(() => {
    const previousHideSidebar = previousHideSidebarRef.current;

    setHideSidebar(true);

    return () => {
      setHideSidebar(previousHideSidebar);
    };
  }, [setHideSidebar]);

  return (
    <div className="space-y-5" onClick={() => setFieldContextMenu(null)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/module/${classId}`}>
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="mt-4 text-2xl font-semibold">Edit Template</h1>
          <p className="mt-1 text-sm text-muted-foreground">{moduleTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {template.templateName} | Page {template.page} |{" "}
            {template.canvas.width} x {template.canvas.height} | X{" "}
            {template.canvas.minX}-{template.canvas.maxX} | Y{" "}
            {template.canvas.minY}-{template.canvas.maxY}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Input
              accept="application/pdf"
              className="hidden"
              disabled={isUploadingPdf}
              id="certificate-pdf-upload"
              multiple={false}
              onChange={handleUploadPdf}
              ref={pdfInputRef}
              type="file"
            />
            <Button
              disabled={isUploadingPdf}
              onClick={() => pdfInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              {isUploadingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="h-4 w-4" />
              )}
              Upload PDF
            </Button>
          </div>
          <Button
            onClick={() => {
              const firstPageBounds = pdfBounds?.pages?.[0] || DEFAULT_PAGE_BOUNDS;
              const resetTemplate = {
                ...buildDefaultTemplate(firstPageBounds),
                templateName:
                  pdfBounds?.templateName ||
                  template.templateName ||
                  CERTIFICATE_TEMPLATE_NAME,
              };
              setTemplate(resetTemplate);
              setSelectedFieldInstanceId(
                resetTemplate.fields[0]?.instanceId || ""
              );
              setFieldContextMenu(null);
            }}
            type="button"
            variant="outline"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button disabled={isSaving} onClick={handleSave} type="button">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Simpan Template
          </Button>
        </div>
      </div>
      {uploadedPdfName ? (
        <p className="text-xs text-muted-foreground">
          PDF terakhir di-upload: {uploadedPdfName}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[480px] items-center justify-center rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat template
          </div>
        </div>
      ) : (
        <div className="grid gap-2 lg:-mx-3 lg:grid-cols-[210px_minmax(0,1fr)_250px] xl:-mx-4">
          <div
            className="rounded-lg border bg-muted/20 p-2 lg:sticky lg:top-3 lg:max-h-[calc(100vh-1.5rem)] lg:self-start lg:overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 px-1">
              <h2 className="text-sm font-semibold leading-none">Field</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pilih atau drag ke canvas.
              </p>
            </div>
            <Accordion
              className="space-y-1"
              defaultValue={fieldCategories[0]?.id}
              type="single"
              collapsible
            >
              {fieldCategories.map((category) => (
                <AccordionItem
                  className="rounded-md border bg-card px-2"
                  key={category.id}
                  value={category.id}
                >
                  <AccordionTrigger className="py-1.5 hover:no-underline">
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-1.5">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold leading-5">
                          {category.label}
                        </span>
                        <span className="block truncate text-[11px] font-normal leading-3 text-muted-foreground">
                          {category.description}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground">
                        {category.fields.length}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1.5">
                    <div className="grid gap-1">
                      {category.fields.map((field) => {
                        const isAdded = template.fields.some(
                          (item) => item.id === field.id
                        );
                        const tagLabel = getFieldTagLabel(field.id);

                        return (
                          <button
                            className={cn(
                              "group flex min-h-[46px] items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-sm transition-colors hover:border-primary/60 hover:bg-accent/40",
                              selectedField?.id === field.id &&
                                "border-primary bg-primary/5",
                              !template.canvas.previewUrl &&
                                "cursor-not-allowed opacity-60 hover:border-border"
                            )}
                            disabled={!template.canvas.previewUrl}
                            draggable={Boolean(template.canvas.previewUrl)}
                            key={field.id}
                            onClick={() => addField(field.id, field)}
                            onDragStart={(event) => {
                              event.dataTransfer.setData(
                                "certificate-field",
                                field.id
                              );
                              event.dataTransfer.setData(
                                "certificate-field-label",
                                field.label
                              );
                              event.dataTransfer.setData(
                                "certificate-field-value",
                                field.value
                              );
                              setDragFieldId(field.id);
                            }}
                            onDragEnd={() => setDragFieldId(null)}
                            type="button"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                              {field.icon}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="truncate text-[13px] font-medium leading-4 text-foreground">
                                {field.label}
                              </span>
                              <span className="flex min-w-0 items-center justify-between gap-1.5">
                                <span className="truncate rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase leading-none text-muted-foreground">
                                  {tagLabel}
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium leading-none",
                                    isAdded
                                      ? "bg-primary/10 text-primary"
                                      : "bg-transparent text-muted-foreground"
                                  )}
                                >
                                  {isAdded ? "Aktif" : "Drag"}
                                </span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="min-w-0 rounded-lg bg-card p-2">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Canvas Sertifikat</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Canvas mengikuti coordinate bounds dari API.
                </p>
              </div>
              {pdfBounds?.pages?.length ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {pdfBounds.pages.map((page) => (
                    <Button
                      key={page.page}
                      onClick={() => applyPageBounds(page)}
                      size="sm"
                      type="button"
                      variant={selectedPage === page.page ? "default" : "outline"}
                    >
                      Page {page.page}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="overflow-auto rounded-md border bg-muted/30 p-2">
              <div
                className="relative mx-auto w-full min-w-[560px] overflow-hidden bg-white text-slate-950 shadow-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedFieldInstanceId("");
                  setFieldContextMenu(null);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setFieldContextMenu(null);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                ref={canvasRef}
                style={{
                  aspectRatio: `${template.canvas.width} / ${template.canvas.height}`,
                  backgroundColor: template.canvas.backgroundColor,
                }}
              >
                {template.canvas.previewUrl ? (
                  <iframe
                    className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    src={`${template.canvas.previewUrl}#page=${template.page}&toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                    title={`Template sertifikat ${template.templateName} page ${template.page}`}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center">
                      <p className="text-sm font-medium">
                        Belum ada template sertifikat yang di upload
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Upload PDF untuk mulai mengatur field sertifikat.
                      </p>
                    </div>
                  </div>
                )}
                <DndContext
                  modifiers={[restrictToParentElement]}
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
                  sensors={sensors}
                >
                  {template.fields.map((field) => (
                    <CertificateCanvasField
                      canvas={template.canvas}
                      field={field}
                      isSelected={
                        selectedFieldInstanceId === field.instanceId
                      }
                      key={field.instanceId}
                      onContextMenu={(_, x, y) =>
                        setFieldContextMenu({
                          instanceId: field.instanceId,
                          x,
                          y,
                        })
                      }
                      onResize={(instanceId, updates) =>
                        updateField(instanceId, updates)
                      }
                      onSelect={setSelectedFieldInstanceId}
                    />
                  ))}
                </DndContext>
                {fieldContextMenu ? (
                  <div
                    className="fixed z-50 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      left: fieldContextMenu.x,
                      top: fieldContextMenu.y,
                    }}
                  >
                    <Button
                      className="h-8 justify-start px-2 text-destructive hover:text-destructive"
                      onClick={() => deleteField(fieldContextMenu.instanceId)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className="grid gap-3 rounded-lg border bg-muted/20 p-2 lg:sticky lg:top-3 lg:max-h-[calc(100vh-1.5rem)] lg:self-start lg:overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                <Grip className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Properti Field</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Atur posisi, ukuran, dan tampilan field.
                </p>
              </div>
            </div>
            {selectedField ? (
              <div className="grid gap-3">
                <Accordion
                  className="space-y-2"
                  defaultValue="content"
                  type="single"
                  collapsible
                >
                  <AccordionItem className="rounded-md border bg-card px-3" value="content">
                    <AccordionTrigger className="py-2.5 hover:no-underline">
                      Konten
                    </AccordionTrigger>
                    <AccordionContent className="grid gap-3 pb-3">
                      <div className="grid gap-2">
                        <Label>Label</Label>
                        <Input
                          onChange={(event) =>
                            updateField(selectedField.instanceId, {
                              label: event.target.value,
                            })
                          }
                          value={selectedField.label}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                        <Label
                          className="text-sm font-normal"
                          htmlFor="field-variable-mode"
                        >
                          Variable
                        </Label>
                        <Switch
                          checked={selectedField.isVariable}
                          id="field-variable-mode"
                          onCheckedChange={(checked) =>
                            updateField(selectedField.instanceId, {
                              isVariable: checked,
                              value: checked
                                ? getFieldVariableValue(selectedField.id)
                                : getFieldDisplayValue(selectedField.id),
                            })
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem className="rounded-md border bg-card px-3" value="layout">
                    <AccordionTrigger className="py-2.5 hover:no-underline">
                      Posisi & Ukuran
                    </AccordionTrigger>
                    <AccordionContent className="grid gap-3 pb-3">
                      <div className="grid gap-2">
                        <Label>X</Label>
                        <Input
                          min={0}
                          onChange={(event) =>
                            updateField(selectedField.instanceId, {
                              x: Number(event.target.value),
                            })
                          }
                          type="number"
                          value={Math.round(selectedField.x)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Y</Label>
                        <Input
                          min={0}
                          onChange={(event) =>
                            updateField(selectedField.instanceId, {
                              y: Number(event.target.value),
                            })
                          }
                          type="number"
                          value={Math.round(selectedField.y)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>
                          {selectedField.id === "qrCode"
                            ? "Ukuran"
                            : isSignatureField(selectedField.id)
                              ? "Width"
                              : "Lebar"}
                        </Label>
                        <Input
                          min={
                            selectedField.id === "qrCode" ||
                            isSignatureField(selectedField.id)
                              ? 40
                              : 120
                          }
                          onChange={(event) =>
                            updateField(selectedField.instanceId, {
                              width: Number(event.target.value),
                            })
                          }
                          type="number"
                          value={selectedField.width}
                        />
                      </div>
                      {selectedField.id !== "qrCode" ? (
                        <div className="grid gap-2">
                          <Label>Height</Label>
                          <Input
                            min={isSignatureField(selectedField.id) ? 24 : 20}
                            onChange={(event) =>
                              updateField(selectedField.instanceId, {
                                height: Number(event.target.value),
                              })
                            }
                            type="number"
                            value={
                              selectedField.height || getFieldHeight(selectedField)
                            }
                          />
                        </div>
                      ) : null}
                      {selectedField.id !== "qrCode" &&
                      !isSignatureField(selectedField.id) ? (
                        <>
                          <div className="grid gap-2">
                            <Label>Ukuran Font</Label>
                            <Input
                              min={12}
                              onChange={(event) =>
                                updateField(selectedField.instanceId, {
                                  fontSize: Number(event.target.value),
                                })
                              }
                              type="number"
                              value={selectedField.fontSize}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Max Width</Label>
                            <Input
                              min={40}
                              onChange={(event) =>
                                updateField(selectedField.instanceId, {
                                  maxWidth: Number(event.target.value),
                                })
                              }
                              type="number"
                              value={selectedField.maxWidth || selectedField.width}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Line Height</Label>
                            <Input
                              max={3}
                              min={0.8}
                              onChange={(event) =>
                                updateField(selectedField.instanceId, {
                                  lineHeight: Number(event.target.value),
                                })
                              }
                              step={0.1}
                              type="number"
                              value={selectedField.lineHeight || 1.2}
                            />
                          </div>
                        </>
                      ) : null}
                      <div className="grid gap-2">
                        <Label>Rotate</Label>
                        <Input
                          max={360}
                          min={-360}
                          onChange={(event) =>
                            updateField(selectedField.instanceId, {
                              rotate: Number(event.target.value),
                            })
                          }
                          type="number"
                          value={selectedField.rotate || 0}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {selectedField.id !== "qrCode" &&
                  !isSignatureField(selectedField.id) ? (
                    <AccordionItem className="rounded-md border bg-card px-3" value="style">
                      <AccordionTrigger className="py-2.5 hover:no-underline">
                        Tampilan
                      </AccordionTrigger>
                      <AccordionContent className="grid gap-3 pb-3">
                        <div className="grid gap-2">
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            <Input
                              className="h-9 w-12 shrink-0 p-1"
                              disabled={selectedField.isVariable}
                              onChange={(event) =>
                                updateField(selectedField.instanceId, {
                                  color: event.target.value,
                                })
                              }
                              type="color"
                              value={selectedField.color || "#0f172a"}
                            />
                            <Input
                              disabled={selectedField.isVariable}
                              onChange={(event) =>
                                updateField(selectedField.instanceId, {
                                  color: event.target.value,
                                })
                              }
                              value={selectedField.color || "#0f172a"}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Font</Label>
                          <Select
                            onValueChange={(fontFamily) =>
                              updateField(selectedField.instanceId, {
                                font: fontFamily,
                                fontFamily,
                              })
                            }
                            value={
                              selectedField.fontFamily ||
                              selectedField.font ||
                              "Arial"
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih font" />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_OPTIONS.map((fontFamily) => (
                                <SelectItem key={fontFamily} value={fontFamily}>
                                  {fontFamily}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Format</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              onClick={() =>
                                updateField(selectedField.instanceId, {
                                  weight:
                                    selectedField.weight === "bold"
                                      ? "normal"
                                      : "bold",
                                })
                              }
                              type="button"
                              variant={
                                selectedField.weight === "bold"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              <Bold className="h-4 w-4" />
                              Bold
                            </Button>
                            <Button
                              onClick={() =>
                                updateField(selectedField.instanceId, {
                                  italic: !selectedField.italic,
                                })
                              }
                              type="button"
                              variant={
                                selectedField.italic ? "default" : "outline"
                              }
                            >
                              <Italic className="h-4 w-4" />
                              Italic
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Paragraph Style</Label>
                          <Select
                            onValueChange={(value) => {
                              const paragraphStyle =
                                value as CertificateField["paragraphStyle"];
                              const option = PARAGRAPH_STYLE_OPTIONS.find(
                                (item) => item.value === paragraphStyle
                              );

                              if (!option) {
                                return;
                              }

                              updateField(selectedField.instanceId, {
                                fontSize: option.fontSize,
                                lineHeight: option.lineHeight,
                                paragraphSpacing: option.paragraphSpacing,
                                paragraphStyle,
                                weight: option.weight,
                              });
                            }}
                            value={selectedField.paragraphStyle || "normal"}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih style" />
                            </SelectTrigger>
                            <SelectContent>
                              {PARAGRAPH_STYLE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Align</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["left", "center", "right"] as const).map(
                              (align) => (
                                <Button
                                  key={align}
                                  onClick={() =>
                                    updateField(selectedField.instanceId, {
                                      align,
                                    })
                                  }
                                  type="button"
                                  variant={
                                    selectedField.align === align
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {align}
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null}
                </Accordion>
                <Button
                  className="justify-start text-destructive hover:text-destructive"
                  onClick={() => deleteField(selectedField.instanceId)}
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Field
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-dashed bg-background p-4 text-center">
                <p className="text-sm font-medium">Field belum dipilih</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pilih field pada canvas untuk mengubah properti.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
