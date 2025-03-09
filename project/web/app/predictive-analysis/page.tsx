import PatientInfo from "./patientComponent";
import BarChart from "./barChart";
export default function PredictiveAnalysisPage() {
    return (
      <div className = "flex">
        <PatientInfo/>
        <BarChart/>
      </div>
    );
};