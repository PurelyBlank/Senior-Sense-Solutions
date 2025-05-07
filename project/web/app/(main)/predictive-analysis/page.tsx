import FallChart from "./FallChart";
import HeartRateChart from "./HeartRateChart";
import PatientActivity from "./PatientActivity";
import PatientInfo from "../components/patient-component/PatientComponent";
import PatientDropdown from "../components/patient-component/PatientDropdown";

import './page.css'

export default function PredictiveAnalysisPage() {
  return (
    <div className = "PredictiveAnalysisContainer">
      <div className = "AllChartsContainer">
        <div className = "FallChartContainer">
          <FallChart/>
        </div>
  
        <div className = "ChartContainer">
          <PatientActivity/>
          <HeartRateChart/>
        </div>
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