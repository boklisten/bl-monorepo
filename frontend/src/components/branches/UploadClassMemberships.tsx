import UploadCSVFile from "@/components/UploadCSVFile";

export default function UploadClassMemberships() {
  return (
    <UploadCSVFile
      label={"Last opp klassevalg"}
      allowedHeaders={["phone", "branch"]}
      onUpload={(data) => {
        console.log(data);
      }}
    />
  );
}
