import { AuthGuard } from "@/components/AuthGuard";
import EditableSOAPForm from "@/components/soap/EditableSOAPForm";

export default function EditSOAPNote() {
  return (
    <AuthGuard>
      <EditableSOAPForm />
    </AuthGuard>
  );
}