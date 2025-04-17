import FallChart from "./fallChart";
import PatientActivity from "./patientActivity";
import HeartRateChart from "./heartRateChart";
import BloodOxygenChart from "./bloodOxygenChart";

import "./prediciveAnalysis.css";
import PatientInfo from "../biometric-monitor/PatientComponent";

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

      </div>
    );
};