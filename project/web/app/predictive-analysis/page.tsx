import PatientInfo from "./patientComponent";
import FallChart from "./barChart";
import PatientActivity from "./patientActivity";
import HeartRateChart from "./heartRateChart";
import BloodOxygenChart from "./bloodOxygenChart";

import "./PrediciveAnalysis.css";

export default function PredictiveAnalysisPage() {
    return (
      <div className = "PredictiveAnalysisContainer">
        
        <div className = "BarChartsContainer">
          <PatientActivity/>
          <FallChart/>
        </div>

        <div className = "LineChartsContainer">
          <HeartRateChart/>
          <BloodOxygenChart/>
        </div>
        
        <div className = "PatientInfoContainer">
          <PatientInfo/>
        </div>

      </div>
    );
};