import { CertificateTemplateEditor } from "./_component/CertificateTemplateEditor";

type Props = {
  params: {
    classId: string;
    moduleId: string;
  };
};

const Page = ({ params }: Props) => {
  return (
    <CertificateTemplateEditor
      classId={params.classId}
      certificateId={params.moduleId}
    />
  );
};

export default Page;
