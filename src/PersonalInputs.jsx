import { useState, useMemo } from "react";
import {
  Save,
  RotateCcw,
  TrendingUp,
  Wallet,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Upload,
  CheckCircle2,
  SlidersHorizontal,
  CreditCard,
  Briefcase,
  Sparkles
} from "lucide-react";
import { DEFAULT_PERSONAL_INPUTS, PRESET_PROFILES } from "./personalInputsData";

export default function PersonalInputs({
  inputs,
  setInputs,
  currency = "₹",
  onApply,
  showToast
}) {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'income' | 'outflow' | 'assets' | 'goals'
  const [hasChanges, setHasChanges] = useState(false);

  // Field change helper
  const handleChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleNumberChange = (field, value) => {
    const num = value === "" ? 0 : parseFloat(value);
    handleChange(field, isNaN(num) ? 0 : num);
  };

  // Derived Telemetry Computations
  const stats = useMemo(() => {
    const totalInflow =
      (Number(inputs.primaryIncome) || 0) +
      (Number(inputs.secondaryIncome) || 0) +
      (Number(inputs.passiveIncome) || 0);

    const totalOutflow =
      (Number(inputs.housingRent) || 0) +
      (Number(inputs.groceriesDining) || 0) +
      (Number(inputs.utilitiesBills) || 0) +
      (Number(inputs.transportCommute) || 0) +
      (Number(inputs.healthcareInsurance) || 0) +
      (Number(inputs.subscriptionsEntertainment) || 0) +
      (Number(inputs.shoppingDiscretionary) || 0) +
      (Number(inputs.debtLoanEmi) || 0) +
      (Number(inputs.otherCommitments) || 0);

    const netSurplus = totalInflow - totalOutflow;
    const savingsRate =
      totalInflow > 0 ? Math.round((netSurplus / totalInflow) * 100) : 0;

    const liquidReserves =
      (Number(inputs.liquidSavings) || 0) +
      (Number(inputs.emergencyFundCurrent) || 0);

    const totalAssets =
      liquidReserves +
      (Number(inputs.investmentsStocksMutual) || 0) +
      (Number(inputs.retirementProvidentFund) || 0) +
      (Number(inputs.cryptoGoldAssets) || 0);

    const totalLiabilities = Number(inputs.totalLiabilities) || 0;
    const netWorth = totalAssets - totalLiabilities;

    const runwayMonths =
      totalOutflow > 0 ? (liquidReserves / totalOutflow).toFixed(1) : "12+";

    const debtRatio =
      totalInflow > 0
        ? Math.round(((Number(inputs.debtLoanEmi) || 0) / totalInflow) * 100)
        : 0;

    // Simulated Financial Resilience Score (0 - 100)
    let score = 50;
    if (savingsRate >= 30) score += 20;
    else if (savingsRate >= 15) score += 10;
    else if (savingsRate < 0) score -= 20;

    if (parseFloat(runwayMonths) >= 6) score += 15;
    else if (parseFloat(runwayMonths) >= 3) score += 8;

    if (debtRatio === 0) score += 10;
    else if (debtRatio > 35) score -= 15;

    if (inputs.primaryIncome > 0 && totalOutflow > 0) score += 5;

    const clampedScore = Math.max(10, Math.min(98, score));

    let tier = "Moderate";
    if (clampedScore >= 80) tier = "Prime Tier";
    else if (clampedScore >= 65) tier = "Strong Tier";
    else if (clampedScore < 50) tier = "Needs Attention";

    return {
      totalInflow,
      totalOutflow,
      netSurplus,
      savingsRate,
      liquidReserves,
      totalAssets,
      totalLiabilities,
      netWorth,
      runwayMonths,
      debtRatio,
      healthScore: clampedScore,
      tier
    };
  }, [inputs]);

  // Load Preset
  const handleLoadPreset = (key) => {
    const preset = PRESET_PROFILES[key];
    if (preset) {
      setInputs({ ...preset });
      setHasChanges(true);
      showToast(
        "Preset Applied",
        `Loaded "${key.charAt(0).toUpperCase() + key.slice(1)}" profile inputs.`,
        "info"
      );
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    setInputs({ ...DEFAULT_PERSONAL_INPUTS });
    setHasChanges(true);
    showToast("Defaults Restored", "Reset to Finora default personal parameters.", "info");
  };

  // Export Inputs as JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(inputs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `finora_personal_inputs_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Export Successful", "Your personal inputs were downloaded as JSON.", "success");
  };

  // Import Inputs JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed && typeof parsed === "object") {
          setInputs((prev) => ({ ...prev, ...parsed }));
          setHasChanges(true);
          showToast("Import Completed", "Loaded personal inputs from JSON file.", "success");
        }
      } catch {
        showToast("Import Failed", "Invalid JSON format in selected file.", "warning");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Save & Apply
  const handleApply = () => {
    localStorage.setItem("finora_personal_inputs", JSON.stringify(inputs));
    setHasChanges(false);
    if (onApply) {
      onApply(inputs, stats);
    }
    showToast(
      "Personal Inputs Synchronized",
      "Dashboard, budgets, and Finora AI Co-Pilot updated with your personal numbers!",
      "success"
    );
  };

  return (
    <div className="personal-inputs-page animate-fade-in">
      {/* PAGE HEADER */}
      <div className="personal-inputs-header">
        <div className="pi-title-block">
          <div className="pi-badge">
            <SlidersHorizontal size={14} />
            <span>CUSTOM USER TELEMETRY</span>
          </div>
          <h2>My Personal Financial Inputs</h2>
          <p>
            Define your real income sources, fixed obligations, assets, and strategic priorities.
            Finora AI will customize all analytics, budget caps, and co-pilot recommendations to your situation.
          </p>
        </div>

        <div className="pi-header-actions">
          <div className="preset-dropdown-wrap">
            <span className="preset-label">Quick Archetype:</span>
            <div className="preset-pills">
              <button
                type="button"
                className="preset-btn"
                onClick={() => handleLoadPreset("salaried")}
                title="Salaried Corporate Tech"
              >
                Salaried
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => handleLoadPreset("freelancer")}
                title="Freelancer / Consultant"
              >
                Freelancer
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => handleLoadPreset("starter")}
                title="Student / Early Career"
              >
                Starter
              </button>
              <button
                type="button"
                className="preset-btn text-muted"
                onClick={() => handleLoadPreset("blank")}
                title="Zero all fields"
              >
                Blank
              </button>
            </div>
          </div>

          <div className="pi-main-actions">
            <label className="secondary-btn import-btn" title="Import JSON Profile">
              <Upload size={15} />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImportJSON}
              />
            </label>

            <button
              type="button"
              className="secondary-btn"
              onClick={handleExportJSON}
              title="Export inputs to JSON"
            >
              <Download size={15} />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="secondary-btn text-muted"
              onClick={handleResetToDefault}
              title="Reset to default template"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              className={`primary-btn pi-save-btn ${hasChanges ? "pulse-save" : ""}`}
              onClick={handleApply}
            >
              <Save size={16} />
              <span>{hasChanges ? "Save & Sync to App *" : "Saved & In Sync"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE TELEMETRY IMPACT BANNER */}
      <div className="pi-telemetry-banner">
        <div className="telemetry-card inflow-card">
          <div className="tc-top">
            <span className="tc-label">Total Monthly Inflow</span>
            <div className="tc-icon-wrap green">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <h3 className="tc-val positive">
            {currency}
            {stats.totalInflow.toLocaleString("en-IN")}
          </h3>
          <div className="tc-subtext">
            <span>Primary: {currency}{Number(inputs.primaryIncome || 0).toLocaleString()}</span>
            <span>+ Freelance: {currency}{Number(inputs.secondaryIncome || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="telemetry-card outflow-card">
          <div className="tc-top">
            <span className="tc-label">Total Commitments</span>
            <div className="tc-icon-wrap red">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <h3 className="tc-val negative">
            {currency}
            {stats.totalOutflow.toLocaleString("en-IN")}
          </h3>
          <div className="tc-subtext">
            <span>
              {stats.totalInflow > 0
                ? `${Math.round((stats.totalOutflow / stats.totalInflow) * 100)}% of income`
                : "Fixed spend"}
            </span>
          </div>
        </div>

        <div className="telemetry-card surplus-card">
          <div className="tc-top">
            <span className="tc-label">Monthly Net Surplus</span>
            <div className="tc-icon-wrap purple">
              <TrendingUp size={16} />
            </div>
          </div>
          <h3 className={`tc-val ${stats.netSurplus >= 0 ? "positive" : "negative"}`}>
            {stats.netSurplus >= 0 ? "+" : ""}
            {currency}
            {stats.netSurplus.toLocaleString("en-IN")}
          </h3>
          <div className="tc-subtext">
            <span className="positive-chip">{stats.savingsRate}% Savings Rate</span>
            <span>target: {inputs.targetSavingsRate}%</span>
          </div>
        </div>

        <div className="telemetry-card networth-card">
          <div className="tc-top">
            <span className="tc-label">Net Worth Baseline</span>
            <div className="tc-icon-wrap blue">
              <Shield size={16} />
            </div>
          </div>
          <h3 className="tc-val accent">
            {currency}
            {stats.netWorth.toLocaleString("en-IN")}
          </h3>
          <div className="tc-subtext">
            <span>Runway: <strong>{stats.runwayMonths} mos</strong></span>
            <span className="health-tier-tag">{stats.healthScore}/100 {stats.tier}</span>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="pi-tabs-bar">
        {[
          { id: "all", label: "All Inputs" },
          { id: "identity", label: "1. Identity & Career" },
          { id: "income", label: "2. Monthly Inflow" },
          { id: "outflow", label: "3. Commitments & Outflows" },
          { id: "assets", label: "4. Assets & Balances" },
          { id: "ai", label: "5. AI Directives & Targets" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`pi-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INPUT FORM SECTIONS */}
      <div className="pi-form-sections-grid">
        {/* SECTION 1: IDENTITY & CAREER */}
        {(activeTab === "all" || activeTab === "identity") && (
          <div className="panel pi-section-panel">
            <div className="pi-panel-header">
              <div className="pi-panel-icon">
                <Briefcase size={18} />
              </div>
              <div>
                <h3>Personal Identity & Career Profile</h3>
                <p>Establishes your life stage, tax bracket context, and retirement horizon</p>
              </div>
            </div>

            <div className="pi-grid-dual">
              <div className="form-field">
                <label>Full Legal / Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Guest or your name"
                  value={inputs.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. user@finora.ai"
                  value={inputs.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Current Age</label>
                <input
                  type="number"
                  min="16"
                  max="100"
                  value={inputs.age}
                  onChange={(e) => handleNumberChange("age", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Target Retirement Age</label>
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={inputs.targetRetirementAge}
                  onChange={(e) =>
                    handleNumberChange("targetRetirementAge", e.target.value)
                  }
                />
                <span className="field-hint">
                  {Math.max(0, (inputs.targetRetirementAge || 60) - (inputs.age || 25))} years to horizon
                </span>
              </div>

              <div className="form-field">
                <label>Occupation / Profession</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Doctor, Designer"
                  value={inputs.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Employment Model</label>
                <select
                  value={inputs.employmentType}
                  onChange={(e) => handleChange("employmentType", e.target.value)}
                >
                  <option value="Salaried Full-time">Salaried Full-time (Fixed Monthly Inflow)</option>
                  <option value="Freelancer / Consultant">Freelancer / Consultant (Variable Inflows)</option>
                  <option value="Business Owner / Founder">Business Owner / Founder (Draws & Dividends)</option>
                  <option value="Student / Early Career">Student / Early Career (Starter Budget)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Financially Dependent Family Members</label>
                <select
                  value={inputs.dependents}
                  onChange={(e) => handleNumberChange("dependents", e.target.value)}
                >
                  <option value={0}>0 (Independent)</option>
                  <option value={1}>1 Dependent</option>
                  <option value={2}>2 Dependents</option>
                  <option value={3}>3+ Dependents</option>
                </select>
              </div>

              <div className="form-field">
                <label>Risk Tolerance Profile</label>
                <div className="risk-selector-row">
                  {["Conservative", "Moderate", "Aggressive"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`risk-btn ${inputs.riskTolerance === r ? "active" : ""}`}
                      onClick={() => handleChange("riskTolerance", r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MONTHLY INFLOWS */}
        {(activeTab === "all" || activeTab === "income") && (
          <div className="panel pi-section-panel">
            <div className="pi-panel-header">
              <div className="pi-panel-icon income-icon">
                <Wallet size={18} />
              </div>
              <div>
                <h3>Monthly Inflows & Revenue Streams ({currency})</h3>
                <p>Provide your net take-home receipts after taxes and withholdings</p>
              </div>
            </div>

            <div className="pi-grid-dual">
              <div className="form-field">
                <label>Primary Take-Home Pay / Salary ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="500"
                    placeholder="0"
                    value={inputs.primaryIncome}
                    onChange={(e) =>
                      handleNumberChange("primaryIncome", e.target.value)
                    }
                  />
                </div>
                <span className="field-hint">Fixed monthly deposited base</span>
              </div>

              <div className="form-field">
                <label>Secondary / Freelance / Retainer Income ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="500"
                    placeholder="0"
                    value={inputs.secondaryIncome}
                    onChange={(e) =>
                      handleNumberChange("secondaryIncome", e.target.value)
                    }
                  />
                </div>
                <span className="field-hint">Average monthly side-project inflows</span>
              </div>

              <div className="form-field">
                <label>Passive Inflow (Rental / Dividends / Interest) ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="500"
                    placeholder="0"
                    value={inputs.passiveIncome}
                    onChange={(e) =>
                      handleNumberChange("passiveIncome", e.target.value)
                    }
                  />
                </div>
                <span className="field-hint">Investments or real estate receipts</span>
              </div>

              <div className="form-field">
                <label>Expected Annual Bonus / Incentive ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="1000"
                    placeholder="0"
                    value={inputs.annualBonus}
                    onChange={(e) =>
                      handleNumberChange("annualBonus", e.target.value)
                    }
                  />
                </div>
                <span className="field-hint">
                  Approx. +{currency}{Math.round((inputs.annualBonus || 0) / 12).toLocaleString()}/mo amortized
                </span>
              </div>
            </div>

            <div className="pi-summary-strip green-strip">
              <span>Combined Monthly Inflow Velocity:</span>
              <strong>
                {currency}
                {stats.totalInflow.toLocaleString("en-IN")} / month
              </strong>
            </div>
          </div>
        )}

        {/* SECTION 3: MONTHLY OUTFLOWS & COMMITMENTS */}
        {(activeTab === "all" || activeTab === "outflow") && (
          <div className="panel pi-section-panel">
            <div className="pi-panel-header">
              <div className="pi-panel-icon outflow-icon">
                <CreditCard size={18} />
              </div>
              <div>
                <h3>Monthly Fixed & Living Commitments ({currency})</h3>
                <p>Categorize essential baseline expenditures to establish safety ceilings</p>
              </div>
            </div>

            <div className="pi-grid-triple">
              <div className="form-field">
                <label>Housing & Rent / EMI ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="500"
                    value={inputs.housingRent}
                    onChange={(e) =>
                      handleNumberChange("housingRent", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Food, Groceries & Dining ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="500"
                    value={inputs.groceriesDining}
                    onChange={(e) =>
                      handleNumberChange("groceriesDining", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Utilities, Wi-Fi & Power ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="100"
                    value={inputs.utilitiesBills}
                    onChange={(e) =>
                      handleNumberChange("utilitiesBills", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Transport, Fuel & Commute ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="100"
                    value={inputs.transportCommute}
                    onChange={(e) =>
                      handleNumberChange("transportCommute", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Health & Term Insurance ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="100"
                    value={inputs.healthcareInsurance}
                    onChange={(e) =>
                      handleNumberChange("healthcareInsurance", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Subscriptions & Entertainment ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="100"
                    value={inputs.subscriptionsEntertainment}
                    onChange={(e) =>
                      handleNumberChange("subscriptionsEntertainment", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Discretionary & Shopping ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="500"
                    value={inputs.shoppingDiscretionary}
                    onChange={(e) =>
                      handleNumberChange("shoppingDiscretionary", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Loan / Debt EMI Repayments ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="500"
                    value={inputs.debtLoanEmi}
                    onChange={(e) =>
                      handleNumberChange("debtLoanEmi", e.target.value)
                    }
                  />
                </div>
                <span className="field-hint">
                  {inputs.debtLoanEmi > 0 ? "Debt servicing active" : "0% Debt-free"}
                </span>
              </div>

              <div className="form-field">
                <label>Other Miscellaneous Expenses ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="200"
                    value={inputs.otherCommitments}
                    onChange={(e) =>
                      handleNumberChange("otherCommitments", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pi-summary-strip red-strip">
              <span>Total Monthly Fixed Outflow Commitment:</span>
              <strong>
                {currency}
                {stats.totalOutflow.toLocaleString("en-IN")} / month
              </strong>
            </div>
          </div>
        )}

        {/* SECTION 4: ASSETS & BALANCES BASELINE */}
        {(activeTab === "all" || activeTab === "assets") && (
          <div className="panel pi-section-panel">
            <div className="pi-panel-header">
              <div className="pi-panel-icon assets-icon">
                <Shield size={18} />
              </div>
              <div>
                <h3>Assets, Savings & Net Worth Baseline ({currency})</h3>
                <p>Current cumulative balances across your financial institutions</p>
              </div>
            </div>

            <div className="pi-grid-triple">
              <div className="form-field">
                <label>Liquid Bank Checking / Savings ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="1000"
                    value={inputs.liquidSavings}
                    onChange={(e) =>
                      handleNumberChange("liquidSavings", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Dedicated Emergency Fund Stash ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="1000"
                    value={inputs.emergencyFundCurrent}
                    onChange={(e) =>
                      handleNumberChange("emergencyFundCurrent", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Equities, Stocks & Mutual Funds ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="1000"
                    value={inputs.investmentsStocksMutual}
                    onChange={(e) =>
                      handleNumberChange("investmentsStocksMutual", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Retirement / EPF / PPF / 401k ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="1000"
                    value={inputs.retirementProvidentFund}
                    onChange={(e) =>
                      handleNumberChange("retirementProvidentFund", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Gold, Crypto & Alternative Assets ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="1000"
                    value={inputs.cryptoGoldAssets}
                    onChange={(e) =>
                      handleNumberChange("cryptoGoldAssets", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Total Outstanding Debts & Liabilities ({currency})</label>
                <div className="input-with-icon">
                  <span className="curr-prefix">{currency}</span>
                  <input
                    type="number"
                    step="1000"
                    value={inputs.totalLiabilities}
                    onChange={(e) =>
                      handleNumberChange("totalLiabilities", e.target.value)
                    }
                  />
                </div>
                <span className="field-hint">
                  Loans, credit card balance, car finance
                </span>
              </div>
            </div>

            <div className="pi-summary-strip blue-strip">
              <span>Calculated Consolidated Net Worth:</span>
              <strong>
                {currency}
                {stats.netWorth.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        )}

        {/* SECTION 5: AI DIRECTIVES & STRATEGY */}
        {(activeTab === "all" || activeTab === "ai") && (
          <div className="panel pi-section-panel">
            <div className="pi-panel-header">
              <div className="pi-panel-icon ai-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h3>FINORA AI Strategic Directives & Context</h3>
                <p>Instruct your autonomous co-pilot on your personal goals and boundaries</p>
              </div>
            </div>

            <div className="pi-grid-dual">
              <div className="form-field">
                <label>Primary Financial Objective</label>
                <select
                  value={inputs.primaryGoal}
                  onChange={(e) => handleChange("primaryGoal", e.target.value)}
                >
                  <option value="Wealth Creation & Emergency Runway">Wealth Creation & Emergency Runway</option>
                  <option value="Buying a Home / Property Down Payment">Buying a Home / Property Down Payment</option>
                  <option value="Aggressive Debt Liquidation">Aggressive Debt Liquidation</option>
                  <option value="Early Retirement & Financial Freedom (FIRE)">Early Retirement & Financial Freedom (FIRE)</option>
                  <option value="Higher Education / Wedding / Life Event">Higher Education / Wedding / Life Event</option>
                </select>
              </div>

              <div className="form-field">
                <div className="slider-header-row">
                  <label>Target Monthly Savings Rate: {inputs.targetSavingsRate}%</label>
                  <span className="positive">
                    {currency}
                    {Math.round((stats.totalInflow * inputs.targetSavingsRate) / 100).toLocaleString()}/mo target
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={inputs.targetSavingsRate}
                  onChange={(e) =>
                    handleNumberChange("targetSavingsRate", e.target.value)
                  }
                  className="custom-range-slider"
                />
              </div>

              <div className="form-field">
                <label>Target Emergency Fund Buffer (Months of Expenses)</label>
                <select
                  value={inputs.targetEmergencyMonths}
                  onChange={(e) =>
                    handleNumberChange("targetEmergencyMonths", e.target.value)
                  }
                >
                  <option value={3}>3 Months (Lean standard)</option>
                  <option value={6}>6 Months (Recommended resilient standard)</option>
                  <option value={9}>9 Months (High safety buffer)</option>
                  <option value={12}>12 Months (Freelancer / Founder safe tier)</option>
                </select>
                <span className="field-hint">
                  Target Stash: {currency}{Math.round(stats.totalOutflow * inputs.targetEmergencyMonths).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="form-field" style={{ marginTop: 14 }}>
              <label>Custom Personal Instructions & Guardrails for Finora AI</label>
              <textarea
                rows={4}
                placeholder="Tell Finora AI any specific rules or personal goals. E.g.: 'I am planning to buy a car in Nov 2027. Remind me if weekend food spend exceeds ₹2,000. Prioritize tax-saving index funds over active trading.'"
                value={inputs.customDirectives}
                onChange={(e) => handleChange("customDirectives", e.target.value)}
                className="custom-directives-textarea"
              />
              <span className="field-hint">
                Finora AI Co-Pilot reads this direct instruction on every consultation.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="pi-bottom-bar">
        <div className="pi-bottom-info">
          <CheckCircle2 size={18} className="text-emerald" />
          <span>
            {hasChanges
              ? "You have unsaved changes in your personal inputs."
              : "All inputs are active and synchronized with Dashboard, Budgets & AI."}
          </span>
        </div>

        <div className="pi-bottom-btns">
          <button
            type="button"
            className="secondary-btn"
            onClick={handleResetToDefault}
          >
            Reset
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleApply}
          >
            <Save size={16} />
            <span>Apply & Sync to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
