import FallChart from "./fallChart";
import PatientActivity from "./patientActivity";
import HeartRateChart from "./heartRateChart";
import BloodOxygenChart from "./bloodOxygenChart";

import './predictiveAnalysis.css'
import PatientInfo from "../components/patient-component/PatientComponent";
import PatientDropdown from "../components/patient-component/patient-dropdown";

export default function PredictiveAnalysisPage() {
    return (
      <div className = "PredictiveAnalysisContainer">
      
        <div className = "ChartContainer">
          <PatientActivity/>
          <FallChart/>
          <HeartRateChart/>
          <BloodOxygenChart/>
        </div>
  
        <div className = "PatientInfoContainer">
          <PatientInfo/>
        </div>

        <div className = "patient-dropdown-container">
          <PatientDropdown/>
        </div>

      </div>
    );
};