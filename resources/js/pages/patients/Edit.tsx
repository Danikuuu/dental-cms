// resources/js/Pages/Patients/Edit.tsx
import { PatientForm } from './PatientForm';
export default function Edit({ patient }: { patient: any }) {
    return <PatientForm mode="edit" patient={patient} />;
}
