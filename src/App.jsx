import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Bot,
  Target,
  Settings,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
  CreditCard,
  ShoppingBag,
  Coffee,
  Menu,
  Send,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Shield,
  X,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  Calendar,
  Layers,
  Zap,
  ChevronRight,
  Activity,
  Award,
  Home
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import "./App.css";
import PersonalInputs from "./PersonalInputs";
import { DEFAULT_PERSONAL_INPUTS } from "./personalInputsData";

// Dynamic chart datasets for different time ranges
const chartDataSets = {
  "7D": [
    { month: "Mon", income: 0, expenses: 1450, net: -1450 },
    { month: "Tue", income: 0, expenses: 850, net: -850 },
    { month: "Wed", income: 22000, expenses: 3200, net: 18800 },
    { month: "Thu", income: 0, expenses: 1200, net: -1200 },
    { month: "Fri", income: 65000, expenses: 4500, net: 60500 },
    { month: "Sat", income: 0, expenses: 2450, net: -2450 },
    { month: "Sun", income: 0, expenses: 1800, net: -1800 }
  ],
  "1M": [
    { month: "Week 1", income: 65000, expenses: 12400, net: 52600 },
    { month: "Week 2", income: 22000, expenses: 14600, net: 7400 },
    { month: "Week 3", income: 5000, expenses: 9400, net: -4400 },
    { month: "Week 4", income: 0, expenses: 8600, net: -8600 }
  ],
  "6M": [
    { month: "Feb", income: 51000, expenses: 32000, net: 19000 },
    { month: "Mar", income: 46000, expenses: 30000, net: 16000 },
    { month: "Apr", income: 62000, expenses: 39000, net: 23000 },
    { month: "May", income: 57000, expenses: 35000, net: 22000 },
    { month: "Jun", income: 74000, expenses: 42000, net: 32000 },
    { month: "Jul", income: 68000, expenses: 39000, net: 29000 }
  ],
  "1Y": [
    { month: "Aug", income: 45000, expenses: 27000, net: 18000 },
    { month: "Sep", income: 48000, expenses: 29000, net: 19000 },
    { month: "Oct", income: 53000, expenses: 31000, net: 22000 },
    { month: "Nov", income: 56000, expenses: 33000, net: 23000 },
    { month: "Dec", income: 71000, expenses: 44000, net: 27000 },
    { month: "Jan", income: 42000, expenses: 28000, net: 14000 },
    { month: "Feb", income: 51000, expenses: 32000, net: 19000 },
    { month: "Mar", income: 46000, expenses: 30000, net: 16000 },
    { month: "Apr", income: 62000, expenses: 39000, net: 23000 },
    { month: "May", income: 57000, expenses: 35000, net: 22000 },
    { month: "Jun", income: 74000, expenses: 42000, net: 32000 },
    { month: "Jul", income: 68000, expenses: 39000, net: 29000 }
  ]
};

const categorySpendData = [
  { category: "Housing & Rent", amount: 15000, budget: 18000, color: "#60a5fa" },
  { category: "Food & Drinks", amount: 8450, budget: 12000, color: "#10b981" },
  { category: "Shopping", amount: 6200, budget: 8000, color: "#a855f7" },
  { category: "Utilities & Bills", amount: 3500, budget: 5000, color: "#f59e0b" },
  { category: "Entertainment", amount: 2400, budget: 4000, color: "#ec4899" }
];

// Custom Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label, currency = "₹" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-glass">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="tooltip-row">
            <span className="tooltip-dot" style={{ background: entry.color }} />
            <span className="tooltip-name">{entry.name}:</span>
            <strong className="tooltip-val">
              {currency}
              {Number(entry.value).toLocaleString("en-IN")}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function App() {
  const [active, setActive] = useState("Dashboard");
  const [currency, setCurrency] = useState("₹");
  const [themeAccent, setThemeAccent] = useState("emerald");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balanceMasked, setBalanceMasked] = useState(false);

  // Time range & chart display options
  const [timeRange, setTimeRange] = useState("6M");
  const [chartType, setChartType] = useState("area"); // "area" | "bar"

  // Dropdowns & Modals
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Add transaction
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false); // New goal
  const [contributeGoal, setContributeGoal] = useState(null); // Deposit modal
  const [depositAmount, setDepositAmount] = useState(2500);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false); // Edit budget
  const [editingBudget, setEditingBudget] = useState(null);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const showToast = (title, description, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Close sidebar when navigating
  const handleNavClick = (name) => {
    setActive(name);
    setSidebarOpen(false);
  };

  // Interactive notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Salary Credited",
      message: "Monthly salary of ₹65,000 received in your account.",
      time: "25m ago",
      read: false,
      type: "income"
    },
    {
      id: 2,
      title: "Food Budget Threshold",
      message: "Food & Dining spend reached 70% of your safety cap.",
      time: "3h ago",
      read: false,
      type: "alert"
    },
    {
      id: 3,
      title: "Goal Milestone Reached",
      message: "Emergency Fund is now at 65% of your target milestone!",
      time: "1d ago",
      read: false,
      type: "goal"
    },
    {
      id: 4,
      title: "AI Efficiency Strategy",
      message: "Proactive sweep suggested: Shift ₹3,000 to high-yield deposit.",
      time: "2d ago",
      read: true,
      type: "ai"
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("Notifications cleared", "All notifications marked as read.", "info");
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNotificationsOpen(false);
    showToast("Cleared", "All notifications removed.", "info");
  };

  // Dynamic Transactions State
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      name: "Shopping Spree",
      category: "Shopping",
      date: "Today, 10:30 AM",
      amount: -2450,
      iconName: "ShoppingBag",
      paymentMethod: "Apple Pay"
    },
    {
      id: 2,
      name: "Monthly Salary",
      category: "Income",
      date: "Today, 09:00 AM",
      amount: 65000,
      iconName: "Wallet",
      paymentMethod: "Direct Deposit"
    },
    {
      id: 3,
      name: "Artisan Coffee",
      category: "Food & Drinks",
      date: "Yesterday, 04:15 PM",
      amount: -350,
      iconName: "Coffee",
      paymentMethod: "UPI"
    },
    {
      id: 4,
      name: "Tech Gadget Purchase",
      category: "Shopping",
      date: "Yesterday, 11:20 AM",
      amount: -1200,
      iconName: "CreditCard",
      paymentMethod: "Credit Card"
    },
    {
      id: 5,
      name: "Freelance UI Project",
      category: "Income",
      date: "02 Nov, 03:00 PM",
      amount: 22000,
      iconName: "Wallet",
      paymentMethod: "Wire Transfer"
    },
    {
      id: 6,
      name: "Weekly Groceries",
      category: "Food & Drinks",
      date: "01 Nov, 05:45 PM",
      amount: -3200,
      iconName: "ShoppingBag",
      paymentMethod: "Debit Card"
    }
  ]);

  // Form State for Add Transaction
  const [newTx, setNewTx] = useState({
    name: "",
    category: "Food & Drinks",
    amount: "",
    type: "expense",
    paymentMethod: "Credit Card"
  });

  // Filter state for Transactions page
  const [txFilter, setTxFilter] = useState("All");
  const [txCategoryFilter, setTxCategoryFilter] = useState("All");
  const [txSort, setTxSort] = useState("newest");
  const [txSearch, setTxSearch] = useState("");

  // Savings Goals State
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Emergency Fund",
      target: 150000,
      current: 98000,
      deadline: "Dec 2026",
      color: "#10b981",
      category: "Security"
    },
    {
      id: 2,
      title: "New M3 MacBook Pro",
      target: 80000,
      current: 54000,
      deadline: "Feb 2027",
      color: "#38bdf8",
      category: "Hardware"
    },
    {
      id: 3,
      title: "Bali Vacation Retreat",
      target: 50000,
      current: 31000,
      deadline: "Apr 2027",
      color: "#a855f7",
      category: "Travel"
    },
    {
      id: 4,
      title: "Index Fund Stash",
      target: 200000,
      current: 125000,
      deadline: "Aug 2027",
      color: "#f59e0b",
      category: "Wealth"
    }
  ]);

  // New Goal modal form
  const [newGoalForm, setNewGoalForm] = useState({
    title: "",
    target: "",
    deadline: "Dec 2027",
    color: "#10b981",
    category: "Personal"
  });

  // Budget Planner State
  const [budgets, setBudgets] = useState([
    { id: 1, category: "Housing & Rent", limit: 18000, spent: 15000, color: "#60a5fa" },
    { id: 2, category: "Food & Dining", limit: 12000, spent: 8450, color: "#10b981" },
    { id: 3, category: "Shopping & Retail", limit: 8000, spent: 6200, color: "#a855f7" },
    { id: 4, category: "Utilities & Bills", limit: 5000, spent: 3500, color: "#f59e0b" },
    { id: 5, category: "Entertainment", limit: 4000, spent: 2400, color: "#ec4899" }
  ]);

  // AI Assistant Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm FINORA AI, your autonomous financial co-pilot.\n\nI've analyzed your real-time liquidity, cash flow velocity, and budget margins. Your Financial Health Score is 82/100 (Strong Tier). How can I assist your wealth strategy today?",
      timestamp: "Just now"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Personal Inputs State (User's Own Financial Telemetry)
  const [personalInputs, setPersonalInputs] = useState(() => {
    try {
      const saved = localStorage.getItem("finora_personal_inputs");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Omit legacy "Sayan Das" if present in cached browser localStorage
        if (parsed.fullName === "Sayan Das" || !parsed.fullName) {
          parsed.fullName = "Guest";
        }
        if (parsed.email === "sayan@finora.ai" || !parsed.email) {
          parsed.email = "guest@finora.ai";
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_PERSONAL_INPUTS;
  });

  // Settings State
  const [userName, setUserName] = useState(() => {
    if (!personalInputs.fullName || personalInputs.fullName === "Sayan Das") return "Guest";
    return personalInputs.fullName;
  });
  const [userEmail, setUserEmail] = useState(() => {
    if (!personalInputs.email || personalInputs.email === "sayan@finora.ai") return "guest@finora.ai";
    return personalInputs.email;
  });
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [autoSweep, setAutoSweep] = useState(false);

  // Derived user initials for avatars
  const userInitials = useMemo(() => {
    if (!userName || userName.toLowerCase() === "guest") return "G";
    const parts = userName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "G";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [userName]);

  // Calculation helpers
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      Math.abs(
        transactions
          .filter((t) => t.amount < 0)
          .reduce((acc, t) => acc + t.amount, 0)
      ),
    [transactions]
  );

  const [baseSavings, setBaseSavings] = useState(() => {
    const liquid = Number(personalInputs.liquidSavings) || 0;
    const emergency = Number(personalInputs.emergencyFundCurrent) || 0;
    return liquid + emergency > 0 ? liquid + emergency : 58000;
  });

  const netSavings = totalIncome - totalExpenses;
  const totalBalance = baseSavings + netSavings;

  // Synchronization handler when user clicks "Apply & Sync" in Personal Inputs
  const handleApplyPersonalInputs = (updatedInputs, stats) => {
    setPersonalInputs(updatedInputs);
    if (updatedInputs.fullName) setUserName(updatedInputs.fullName);
    if (updatedInputs.email) setUserEmail(updatedInputs.email);

    const newBase =
      (Number(updatedInputs.liquidSavings) || 0) +
      (Number(updatedInputs.emergencyFundCurrent) || 0);
    setBaseSavings(newBase > 0 ? newBase : 58000);

    // Sync realistic ledger based on user's own numbers
    const newTxList = [
      {
        id: Date.now() - 1,
        name: `Primary Take-Home (${updatedInputs.occupation || "Salary"})`,
        category: "Income",
        date: "Today, 09:00 AM",
        amount: Number(updatedInputs.primaryIncome) || 65000,
        iconName: "Wallet",
        paymentMethod: "Direct Deposit"
      },
      ...(Number(updatedInputs.secondaryIncome) > 0
        ? [
            {
              id: Date.now() - 2,
              name: "Secondary Inflow / Freelance",
              category: "Income",
              date: "Yesterday, 03:00 PM",
              amount: Number(updatedInputs.secondaryIncome),
              iconName: "Wallet",
              paymentMethod: "Wire Transfer"
            }
          ]
        : []),
      {
        id: Date.now() - 3,
        name: "Housing & Rent / Mortgage",
        category: "Housing",
        date: "01 Nov, 10:00 AM",
        amount: -(Number(updatedInputs.housingRent) || 15000),
        iconName: "Home",
        paymentMethod: "Bank Transfer"
      },
      {
        id: Date.now() - 4,
        name: "Groceries & Dining Baseline",
        category: "Food & Drinks",
        date: "02 Nov, 06:30 PM",
        amount: -(Number(updatedInputs.groceriesDining) || 8450),
        iconName: "Coffee",
        paymentMethod: "UPI / Card"
      },
      {
        id: Date.now() - 5,
        name: "Utilities & Bills",
        category: "Utilities",
        date: "03 Nov, 11:15 AM",
        amount: -(Number(updatedInputs.utilitiesBills) || 3500),
        iconName: "CreditCard",
        paymentMethod: "Auto-Debit"
      },
      ...(Number(updatedInputs.shoppingDiscretionary) > 0
        ? [
            {
              id: Date.now() - 6,
              name: "Shopping & Retail Discretionary",
              category: "Shopping",
              date: "04 Nov, 05:20 PM",
              amount: -Number(updatedInputs.shoppingDiscretionary),
              iconName: "ShoppingBag",
              paymentMethod: "Credit Card"
            }
          ]
        : [])
    ];
    setTransactions(newTxList);

    // Sync category budgets
    setBudgets([
      {
        id: 1,
        category: "Housing & Rent",
        limit: Math.max(Math.round(Number(updatedInputs.housingRent) * 1.1), 1000),
        spent: Number(updatedInputs.housingRent),
        color: "#60a5fa"
      },
      {
        id: 2,
        category: "Food & Dining",
        limit: Math.max(Math.round(Number(updatedInputs.groceriesDining) * 1.25), 1000),
        spent: Number(updatedInputs.groceriesDining),
        color: "#10b981"
      },
      {
        id: 3,
        category: "Shopping & Retail",
        limit: Math.max(Math.round(Number(updatedInputs.shoppingDiscretionary) * 1.3), 1000),
        spent: Number(updatedInputs.shoppingDiscretionary),
        color: "#a855f7"
      },
      {
        id: 4,
        category: "Utilities & Bills",
        limit: Math.max(Math.round(Number(updatedInputs.utilitiesBills) * 1.2), 1000),
        spent: Number(updatedInputs.utilitiesBills),
        color: "#f59e0b"
      },
      {
        id: 5,
        category: "Entertainment",
        limit: Math.max(Math.round(Number(updatedInputs.subscriptionsEntertainment) * 1.3), 1000),
        spent: Number(updatedInputs.subscriptionsEntertainment),
        color: "#ec4899"
      }
    ]);

    // Push synchronization message to AI chat
    const syncMsg = {
      id: Date.now() + 5,
      sender: "ai",
      text: `🔄 **Personal Financial Profile Synced!**\n\nI have recalibrated your entire workspace with your personal inputs:\n• **Monthly Take-Home**: ${currency}${(stats.totalInflow).toLocaleString("en-IN")}\n• **Fixed Commitments**: ${currency}${(stats.totalOutflow).toLocaleString("en-IN")}\n• **Monthly Free Surplus**: ${currency}${(stats.netSurplus).toLocaleString("en-IN")} (${stats.savingsRate}% Savings Rate)\n• **Resilience Score**: ${stats.healthScore}/100 (${stats.tier})\n• **Emergency Runway**: ${stats.runwayMonths} months\n• **Directives**: ${updatedInputs.customDirectives || "Standard prudent allocation"}\n\nYour dashboard and budgets are now reflecting your personal numbers.`,
      timestamp: "Just now"
    };
    setMessages((prev) => [...prev, syncMsg]);
  };

  // Currency Formatter
  const formatMoney = (val, round = true) => {
    if (balanceMasked) return "••••••••";
    const num = Number(val) || 0;
    const formatted = round
      ? Math.round(num).toLocaleString("en-IN")
      : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency}${formatted}`;
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case "ShoppingBag":
        return ShoppingBag;
      case "Wallet":
        return Wallet;
      case "Coffee":
        return Coffee;
      case "Home":
        return Home;
      case "CreditCard":
      default:
        return CreditCard;
    }
  };

  // Add Transaction Handler
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.name || !newTx.amount) return;

    const val = parseFloat(newTx.amount);
    if (isNaN(val) || val <= 0) return;

    let icon = "CreditCard";
    if (newTx.category.includes("Food") || newTx.category.includes("Coffee")) icon = "Coffee";
    else if (newTx.category.includes("Shopping")) icon = "ShoppingBag";
    else if (newTx.category.includes("Housing")) icon = "Home";
    else if (newTx.type === "income") icon = "Wallet";

    const newItem = {
      id: Date.now(),
      name: newTx.name,
      category: newTx.category,
      date: "Just now",
      amount: newTx.type === "income" ? val : -val,
      iconName: icon,
      paymentMethod: newTx.paymentMethod || "Credit Card"
    };

    setTransactions([newItem, ...transactions]);
    setNewTx({
      name: "",
      category: "Food & Drinks",
      amount: "",
      type: "expense",
      paymentMethod: "Credit Card"
    });
    setIsModalOpen(false);
    showToast(
      "Transaction Recorded",
      `${newItem.name} (${newItem.type === "income" ? "+" : "-"}${currency}${val.toLocaleString()}) saved.`
    );
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = (id) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions(transactions.filter((t) => t.id !== id));
    showToast(
      "Transaction Removed",
      target ? `Removed ${target.name} from records.` : "Entry deleted.",
      "warning"
    );
  };

  // Goal Contribution Handler
  const handleConfirmDeposit = () => {
    if (!contributeGoal || depositAmount <= 0) return;

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === contributeGoal.id) {
          const updated = Math.min(g.target, g.current + Number(depositAmount));
          return { ...g, current: updated };
        }
        return g;
      })
    );

    showToast(
      "Deposit Successful",
      `Added ${currency}${depositAmount.toLocaleString()} to "${contributeGoal.title}".`,
      "success"
    );
    setContributeGoal(null);
  };

  // Add Goal Handler
  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoalForm.title || !newGoalForm.target) return;
    const targetVal = parseFloat(newGoalForm.target);
    if (isNaN(targetVal) || targetVal <= 0) return;

    const goal = {
      id: Date.now(),
      title: newGoalForm.title,
      target: targetVal,
      current: 0,
      deadline: newGoalForm.deadline || "Late 2027",
      color: newGoalForm.color || "#10b981",
      category: newGoalForm.category || "General"
    };

    setGoals([...goals, goal]);
    setIsGoalModalOpen(false);
    setNewGoalForm({
      title: "",
      target: "",
      deadline: "Dec 2027",
      color: "#10b981",
      category: "Personal"
    });
    showToast("Savings Goal Created", `"${goal.title}" target set to ${currency}${targetVal.toLocaleString()}.`);
  };

  // Edit Budget Handler
  const handleSaveBudgetLimit = (e) => {
    e.preventDefault();
    if (!editingBudget) return;
    setBudgets((prev) =>
      prev.map((b) => (b.id === editingBudget.id ? editingBudget : b))
    );
    setIsBudgetModalOpen(false);
    showToast(
      "Budget Ceiling Updated",
      `${editingBudget.category} allocation set to ${currency}${editingBudget.limit.toLocaleString()}.`
    );
  };

  // AI Chat Handler
  const handleSendMessage = (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      timestamp: "Just now"
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = "";
      const lower = query.toLowerCase();

      const userInflow =
        (Number(personalInputs.primaryIncome) || 0) +
        (Number(personalInputs.secondaryIncome) || 0) +
        (Number(personalInputs.passiveIncome) || 0);

      const userCommitments =
        (Number(personalInputs.housingRent) || 0) +
        (Number(personalInputs.groceriesDining) || 0) +
        (Number(personalInputs.utilitiesBills) || 0) +
        (Number(personalInputs.transportCommute) || 0) +
        (Number(personalInputs.healthcareInsurance) || 0) +
        (Number(personalInputs.subscriptionsEntertainment) || 0) +
        (Number(personalInputs.shoppingDiscretionary) || 0) +
        (Number(personalInputs.debtLoanEmi) || 0) +
        (Number(personalInputs.otherCommitments) || 0);

      const userSurplus = userInflow - userCommitments;
      const userSavingsRate =
        userInflow > 0 ? Math.round((userSurplus / userInflow) * 100) : 0;

      const userReserves =
        (Number(personalInputs.liquidSavings) || 0) +
        (Number(personalInputs.emergencyFundCurrent) || 0);

      const userRunway =
        userCommitments > 0 ? (userReserves / userCommitments).toFixed(1) : "6.0";

      const directiveSnippet = personalInputs.customDirectives
        ? `\n\n📌 **Your Stated Directive**: "${personalInputs.customDirectives}"`
        : "";

      if (
        lower.includes("input") ||
        lower.includes("profile") ||
        lower.includes("my data") ||
        lower.includes("personal") ||
        lower.includes("telemetry")
      ) {
        aiResponse = `Here is your active Personal Financial Profile telemetry:\n\n• **User**: ${personalInputs.fullName || userName} (${personalInputs.occupation || "Professional"}, ${personalInputs.age || 26} yrs)\n• **Employment**: ${personalInputs.employmentType}\n• **Total Monthly Inflow**: ${formatMoney(userInflow)}/mo\n• **Monthly Fixed Commitments**: ${formatMoney(userCommitments)}/mo\n• **Free Monthly Surplus**: ${formatMoney(userSurplus)}/mo (${userSavingsRate}% Savings Rate)\n• **Emergency Runway**: ${userRunway} months\n• **Risk Tolerance**: ${personalInputs.riskTolerance} Tier\n• **Primary Objective**: ${personalInputs.primaryGoal}${directiveSnippet}\n\nYou can refine these anytime in the **Personal Inputs** tab!`;
      } else if (
        lower.includes("save") ||
        lower.includes("saving") ||
        lower.includes("10,000") ||
        lower.includes("10000")
      ) {
        aiResponse = `Here is your customized strategy based on your personal inputs (${personalInputs.occupation || "Professional"} profile):\n\n• **Food & Dining**: Trim discretionary dining by 20% (approx. ${formatMoney(Math.round(personalInputs.groceriesDining * 0.2))} saved).\n• **Shopping**: Cap retail discretionary spend at ${formatMoney(Math.round(personalInputs.shoppingDiscretionary * 0.8))}.\n• **Target Allocation**: Direct ${personalInputs.targetSavingsRate}% of monthly surplus (${formatMoney(Math.round(userInflow * (personalInputs.targetSavingsRate / 100)))}) towards "${personalInputs.primaryGoal}".\n\nProjected Annual Surplus: ${formatMoney(userSurplus * 12)}.${directiveSnippet}`;
      } else if (
        lower.includes("budget") ||
        lower.includes("spend") ||
        lower.includes("expense")
      ) {
        aiResponse = `Your total monthly outflow based on your personal ledger is ${formatMoney(totalExpenses)}. \n\nHighest allocations:\n1. Housing: ${formatMoney(personalInputs.housingRent)} (Fixed)\n2. Food & Dining: ${formatMoney(personalInputs.groceriesDining)} (Pacing controlled)\n3. Utilities & Bills: ${formatMoney(personalInputs.utilitiesBills)}\n\nOverall status: Safe Zone with ${formatMoney(userSurplus)} monthly surplus buffer.`;
      } else if (lower.includes("health") || lower.includes("score")) {
        aiResponse = `Your Financial Health Score is evaluated using your real personal telemetry.\n\n• Savings Rate: ${userSavingsRate}% (Target: ${personalInputs.targetSavingsRate}%)\n• Debt-to-Income: ${personalInputs.debtLoanEmi > 0 ? formatMoney(personalInputs.debtLoanEmi) : "0% (Outstanding)"}\n• Emergency Runway: ${userRunway} months (Target: ${personalInputs.targetEmergencyMonths} months)\n• Risk Appetite: ${personalInputs.riskTolerance}\n\nRecommendation: Continue funding reserves until reaching ${personalInputs.targetEmergencyMonths || 6} full months of living expenses.`;
      } else if (
        lower.includes("goal") ||
        lower.includes("emergency") ||
        lower.includes("vacation")
      ) {
        aiResponse = `Milestone tracking is aligned with your primary goal: **"${personalInputs.primaryGoal}"**.\n\n• Liquid Savings: ${formatMoney(personalInputs.liquidSavings)}\n• Dedicated Emergency Fund: ${formatMoney(personalInputs.emergencyFundCurrent)}\n• Investments & Equities: ${formatMoney(personalInputs.investmentsStocksMutual)}\n\nAt your current surplus pace of ${formatMoney(userSurplus)}/mo, your targets are on track!`;
      } else {
        aiResponse = `Portfolio scan complete for ${personalInputs.fullName || userName}.\n\nTotal Net Worth: ${formatMoney(totalBalance)}\nMonthly Inflow: ${formatMoney(userInflow)}\nMonthly Outflow: ${formatMoney(userCommitments)}\nNet Monthly Surplus: ${formatMoney(userSurplus)}\n\nRisk Model: ${personalInputs.riskTolerance} Tier. Would you like me to simulate an automated investment sweep based on your personal inputs?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: aiResponse,
          timestamp: "Just now"
        }
      ]);
      setIsAiTyping(false);
    }, 700);
  };

  // Copy AI message
  const handleCopyMessage = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
    showToast("Copied to Clipboard", "Advice snippet copied.", "info");
  };

  // Filtered & Sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesFilter =
          txFilter === "All" ||
          (txFilter === "Income" && t.amount > 0) ||
          (txFilter === "Expense" && t.amount < 0);

        const matchesCategory =
          txCategoryFilter === "All" || t.category === txCategoryFilter;

        const matchesSearch =
          t.name.toLowerCase().includes(txSearch.toLowerCase()) ||
          t.category.toLowerCase().includes(txSearch.toLowerCase()) ||
          (t.paymentMethod && t.paymentMethod.toLowerCase().includes(txSearch.toLowerCase()));

        return matchesFilter && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (txSort === "highest") return Math.abs(b.amount) - Math.abs(a.amount);
        if (txSort === "lowest") return Math.abs(a.amount) - Math.abs(b.amount);
        if (txSort === "oldest") return a.id - b.id;
        return b.id - a.id; // newest
      });
  }, [transactions, txFilter, txCategoryFilter, txSearch, txSort]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,ID,Name,Category,Date,Amount,Payment Method\n" +
      transactions
        .map(
          (t) =>
            `${t.id},"${t.name}","${t.category}","${t.date}",${t.amount},"${t.paymentMethod || "Card"}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finora_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Export Complete", "Transactions downloaded as CSV file.", "success");
  };

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Personal Inputs", icon: SlidersHorizontal, badge: "MY DATA" },
    { name: "Transactions", icon: ArrowLeftRight },
    { name: "Budget Planner", icon: Wallet },
    { name: "Analytics", icon: ChartNoAxesCombined },
    { name: "AI Assistant", icon: Bot },
    { name: "Savings Goals", icon: Target }
  ];

  return (
    <div className={`app theme-${themeAccent}`}>
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="ambient-radial-glow glow-1" />
      <div className="ambient-radial-glow glow-2" />

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-icon">
              {t.type === "success" && <CheckCircle2 size={18} />}
              {t.type === "warning" && <AlertTriangle size={18} />}
              {t.type === "info" && <Sparkles size={18} />}
            </div>
            <div className="toast-body">
              <strong>{t.title}</strong>
              <p>{t.description}</p>
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="mobile-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <ChartNoAxesCombined size={24} />
            <div className="brand-icon-pulse" />
          </div>
          <div className="brand-text">
            <h2>
              FINORA<span> AI</span>
            </h2>
            <div className="brand-subtitle">
              <span className="live-status-dot" />
              <span>AUTONOMOUS v3.2</span>
            </div>
          </div>
        </div>

        <div className="workspace-pill">
          <div className="workspace-indicator" />
          <div className="workspace-info">
            <strong>Personal Workspace</strong>
            <small>Active Portfolio</small>
          </div>
          <Shield size={14} className="workspace-shield" />
        </div>

        <p className="menu-label">MAIN NAVIGATION</p>

        <nav className="nav-container">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.name;
            return (
              <button
                key={item.name}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.name)}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={18} />
                </div>
                <span>{item.name}</span>
                {item.name === "AI Assistant" && (
                  <span className="nav-badge-ai">LIVE</span>
                )}
                {item.badge && (
                  <span className="nav-badge-ai">{item.badge}</span>
                )}
                {isActive && <div className="nav-active-glow" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-header">
              <div className="upgrade-badge">
                <Sparkles size={14} />
                <span>AI PRO</span>
              </div>
              <Zap size={15} className="upgrade-bolt" />
            </div>
            <h4>Autonomous Wealth Engine</h4>
            <p>Predict cash flow dips 30 days in advance with live ML forecasting.</p>
            <button
              className="upgrade-btn"
              onClick={() => handleNavClick("AI Assistant")}
            >
              Open AI Co-Pilot
            </button>
          </div>

          <button
            className={`nav-item ${active === "Settings" ? "active" : ""}`}
            onClick={() => handleNavClick("Settings")}
          >
            <div className="nav-icon-wrapper">
              <Settings size={18} />
            </div>
            <span>Settings & Security</span>
          </button>

          <div className="profile-card">
            <div className="avatar-wrapper">
              <div className="avatar">{userInitials}</div>
              <div className="avatar-online-dot" />
            </div>
            <div className="profile-info">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <strong>{userName}</strong>
                {userName.toLowerCase() === "guest" && (
                  <span className="guest-pill-badge">GUEST</span>
                )}
              </div>
              <small>{userEmail}</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main">
        {/* FROSTED GLASS TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="page-breadcrumb">
              <div className="breadcrumb">
                <span>Workspace</span>
                <ChevronRight size={12} />
                <span className="current-crumb">{active}</span>
              </div>
              <h1>{active}</h1>
            </div>
          </div>

          <div className="top-actions">
            {/* SEARCH BOX */}
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search transactions, insights..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
              />
              {txSearch && (
                <button
                  className="search-clear-btn"
                  onClick={() => setTxSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* QUICK ADD BUTTON */}
            <button
              className="quick-add-btn"
              onClick={() => setIsModalOpen(true)}
              title="Add Transaction"
            >
              <Plus size={16} />
              <span className="quick-add-label">New Transaction</span>
            </button>

            {/* NOTIFICATION CENTER */}
            <div className="notification-wrapper">
              <button
                className={`icon-btn ${notificationsOpen ? "active" : ""}`}
                title="Notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN POPOVER */}
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-header">
                    <div>
                      <h4>Notifications</h4>
                      <small>{unreadCount} unread alerts</small>
                    </div>
                    <div className="popover-actions">
                      <button
                        className="popover-text-btn"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark read
                      </button>
                      <button
                        className="popover-text-btn muted"
                        onClick={clearNotifications}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="popover-list">
                    {notifications.length === 0 ? (
                      <div className="popover-empty">
                        <CheckCircle2 size={24} />
                        <p>You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`popover-item ${!n.read ? "unread" : ""}`}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((item) =>
                                item.id === n.id ? { ...item, read: true } : item
                              )
                            );
                          }}
                        >
                          <div className={`popover-icon icon-${n.type}`}>
                            {n.type === "income" && <ArrowDownRight size={14} />}
                            {n.type === "alert" && <AlertTriangle size={14} />}
                            {n.type === "goal" && <Target size={14} />}
                            {n.type === "ai" && <Sparkles size={14} />}
                          </div>
                          <div className="popover-content">
                            <strong>{n.title}</strong>
                            <p>{n.message}</p>
                            <span>{n.time}</span>
                          </div>
                          {!n.read && <span className="popover-unread-dot" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER AVATAR */}
            <div
              className="topbar-avatar"
              title={userName}
              onClick={() => handleNavClick("Settings")}
            >
              {userInitials}
            </div>
          </div>
        </header>

        {/* ========================================================
            VIEW 1: DASHBOARD
           ======================================================== */}
        {active === "Dashboard" && (
          <section className="dashboard-page animate-fade-in">
            {/* WELCOME BANNER */}
            <div className="welcome-banner">
              <div className="welcome-text">
                <div className="greeting-row">
                  <h2>Good morning, {userName.split(" ")[0]} 👋</h2>
                  <span
                    className="portfolio-pulse-pill"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleNavClick("Personal Inputs")}
                    title="Click to view and edit your personal inputs"
                  >
                    <span className="pulse-indicator" />
                    Personal Telemetry: {personalInputs.occupation || "Active"} · {personalInputs.riskTolerance}
                  </span>
                </div>
                <p>
                  Cash flow and resilience metrics personalized for {userName} ({personalInputs.occupation || "Portfolio"}).
                </p>
              </div>

              <div className="welcome-actions">
                <button
                  className="secondary-btn"
                  onClick={() => handleNavClick("Personal Inputs")}
                  title="Configure your own income, expenses, and personal goals"
                >
                  <SlidersHorizontal size={16} />
                  <span>Personal Inputs</span>
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => handleNavClick("AI Assistant")}
                >
                  <Bot size={16} />
                  <span>Ask AI Co-Pilot</span>
                </button>
                <button
                  className="primary-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={16} />
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>

            {/* METRICS / STATS GRID */}
            <div className="stats-grid">
              {/* TOTAL BALANCE CARD */}
              <div className="stat-card luxury-card">
                <div className="card-top-row">
                  <div className="card-chip-badge">
                    <CreditCard size={18} />
                    <span>PREMIUM ACCESS</span>
                  </div>
                  <button
                    className="mask-toggle-btn"
                    onClick={() => setBalanceMasked(!balanceMasked)}
                    title={balanceMasked ? "Show Balance" : "Hide Balance"}
                    aria-label="Toggle balance visibility"
                  >
                    {balanceMasked ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="luxury-balance-section">
                  <span className="luxury-label">Consolidated Net Worth</span>
                  <h2 className="luxury-number">{formatMoney(totalBalance, false)}</h2>
                </div>

                <div className="card-bottom-row">
                  <div className="stat-footer positive-pill">
                    <ArrowUpRight size={14} />
                    <span>+14.2%</span>
                    <small>vs prev 30d</small>
                  </div>
                  <span className="card-sub-id">HDFC ·· 4819</span>
                </div>
                <div className="luxury-sheen" />
              </div>

              {/* TOTAL INCOME */}
              <div className="stat-card">
                <div className="stat-heading">
                  <span>Total Inflow</span>
                  <div className="stat-icon-box green">
                    <ArrowDownRight size={18} />
                  </div>
                </div>
                <h2 className="stat-amount positive">
                  {formatMoney(totalIncome)}
                </h2>
                <div className="stat-footer">
                  <span className="positive">
                    <TrendingUp size={14} /> +9.5%
                  </span>
                  <span>vs last cycle</span>
                </div>
              </div>

              {/* TOTAL EXPENSES */}
              <div className="stat-card">
                <div className="stat-heading">
                  <span>Total Outflow</span>
                  <div className="stat-icon-box red">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                <h2 className="stat-amount negative">
                  {formatMoney(totalExpenses)}
                </h2>
                <div className="stat-footer">
                  <span className="neutral">
                    <TrendingDown size={14} /> -2.8%
                  </span>
                  <span>spending rate</span>
                </div>
              </div>

              {/* NET SAVINGS */}
              <div className="stat-card">
                <div className="stat-heading">
                  <span>Net Savings</span>
                  <div className="stat-icon-box purple">
                    <Target size={18} />
                  </div>
                </div>
                <h2 className="stat-amount accent">
                  {formatMoney(netSavings)}
                </h2>
                <div className="stat-footer">
                  <span className="positive">
                    <TrendingUp size={14} /> +18.4%
                  </span>
                  <span>savings efficiency</span>
                </div>
              </div>
            </div>

            {/* CHART & AI INSIGHTS */}
            <div className="middle-grid">
              {/* CASH FLOW CHART PANEL */}
              <div className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <div className="panel-title-with-pill">
                      <h3>Financial Cash Flow</h3>
                      <span className="sub-badge">REAL-TIME TELEMETRY</span>
                    </div>
                    <p>Income velocity versus categorical expenditure</p>
                  </div>

                  <div className="chart-controls">
                    {/* TIMEFRAME TABS */}
                    <div className="timeframe-selector">
                      {["7D", "1M", "6M", "1Y"].map((t) => (
                        <button
                          key={t}
                          className={`timeframe-btn ${timeRange === t ? "active" : ""}`}
                          onClick={() => setTimeRange(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* CHART TYPE SWITCH */}
                    <div className="chart-type-toggle">
                      <button
                        className={`type-switch-btn ${chartType === "area" ? "active" : ""}`}
                        onClick={() => setChartType("area")}
                        title="Area Spline"
                      >
                        Flow
                      </button>
                      <button
                        className={`type-switch-btn ${chartType === "bar" ? "active" : ""}`}
                        onClick={() => setChartType("bar")}
                        title="Bar Comparison"
                      >
                        Bars
                      </button>
                    </div>
                  </div>
                </div>

                <div className="chart-legend-row">
                  <div className="legend-chip">
                    <span className="legend-dot income" />
                    <span>Inflow</span>
                  </div>
                  <div className="legend-chip">
                    <span className="legend-dot expense" />
                    <span>Outflow</span>
                  </div>
                  <div className="legend-summary">
                    <span>
                      Net Trend:{" "}
                      <strong className="positive">
                        +{currency}
                        {(chartDataSets[timeRange] || []).reduce(
                          (acc, c) => acc + c.net,
                          0
                        ) > 0 ? "" : ""}
                        {Math.abs(
                          (chartDataSets[timeRange] || []).reduce(
                            (acc, c) => acc + c.net,
                            0
                          )
                        ).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    {chartType === "area" ? (
                      <AreaChart
                        data={chartDataSets[timeRange] || chartDataSets["6M"]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray="4 4"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          tickLine={false}
                          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                          style={{ fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#64748b"
                          tickLine={false}
                          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                          style={{ fontSize: 11 }}
                          tickFormatter={(v) => `₹${v / 1000}k`}
                        />
                        <Tooltip content={<CustomChartTooltip currency={currency} />} />
                        <Area
                          type="monotone"
                          dataKey="income"
                          name="Income"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#incomeGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          name="Expenses"
                          stroke="#a855f7"
                          strokeWidth={2.5}
                          fill="url(#expenseGrad)"
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={chartDataSets[timeRange] || chartDataSets["6M"]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray="4 4"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          tickLine={false}
                          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                          style={{ fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#64748b"
                          tickLine={false}
                          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                          style={{ fontSize: 11 }}
                          tickFormatter={(v) => `₹${v / 1000}k`}
                        />
                        <Tooltip content={<CustomChartTooltip currency={currency} />} />
                        <Bar
                          dataKey="income"
                          name="Income"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="expenses"
                          name="Expenses"
                          fill="#a855f7"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI INSIGHTS WIDGET */}
              <div className="panel ai-intelligence-panel">
                <div className="ai-panel-header">
                  <div className="ai-badge-group">
                    <div className="ai-header-icon">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3>FINORA Intelligence</h3>
                      <span className="ai-sublabel">PROACTIVE ADVISOR</span>
                    </div>
                  </div>
                  <span className="live-pill">
                    <span className="live-dot" /> LIVE
                  </span>
                </div>

                {/* HEALTH SCORE HERO CARD */}
                <div
                  className="health-score-card"
                  onClick={() => setHealthModalOpen(true)}
                  title="Click to view detailed Diagnostic Audit"
                  role="button"
                  tabIndex={0}
                >
                  <div className="health-score-info">
                    <span className="health-label">Financial Resilience Score</span>
                    <div className="score-number-row">
                      <h2>82</h2>
                      <small>/ 100</small>
                      <span className="tier-tag">Prime</span>
                    </div>
                    <span className="audit-prompt">View complete audit breakdown →</span>
                  </div>

                  <div className="score-radial-meter">
                    <svg viewBox="0 0 80 80" className="radial-svg">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="radial-track"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="radial-bar"
                        strokeDasharray="213.6"
                        strokeDashoffset={213.6 * (1 - 0.82)}
                      />
                    </svg>
                    <div className="meter-center-text">82%</div>
                  </div>
                </div>

                <div className="ai-callout-box">
                  <div className="callout-indicator" />
                  <p>
                    <strong>Positive Momentum:</strong> Net savings velocity is up
                    18.4%. Maintaining current spend caps yields an estimated{" "}
                    <strong>{currency}1,45,000</strong> surplus by Q3.
                  </p>
                </div>

                <div className="insights-mini-list">
                  <div className="insight-card">
                    <div className="insight-index">01</div>
                    <div className="insight-content">
                      <strong>Food & Dining Pacing</strong>
                      <p>
                        Discretionary cafes represent 70% of dining outflow.
                        Capping weekend spend saves ~{currency}1,700.
                      </p>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-index">02</div>
                    <div className="insight-content">
                      <strong>Automated Sweep Setup</strong>
                      <p>
                        Transferring {currency}4,800 from incoming invoices direct
                        to Emergency Fund accelerates goal by 2.2 months.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  className="ai-action-btn"
                  onClick={() => handleNavClick("AI Assistant")}
                >
                  <span>Engage Financial Co-Pilot</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="bottom-grid">
              {/* RECENT TRANSACTIONS */}
              <div className="panel transactions-preview-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent Transactions</h3>
                    <p>Real-time audit log of your payment gateways</p>
                  </div>
                  <button
                    className="view-all-link-btn"
                    onClick={() => handleNavClick("Transactions")}
                  >
                    <span>View All</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="transactions-preview-list">
                  {transactions.slice(0, 4).map((t) => {
                    const Icon = getCategoryIcon(t.iconName);
                    const isPositive = t.amount > 0;
                    return (
                      <div className="tx-item-row" key={t.id}>
                        <div className={`tx-icon-wrapper ${isPositive ? "inflow" : "outflow"}`}>
                          <Icon size={18} />
                        </div>
                        <div className="tx-details">
                          <strong>{t.name}</strong>
                          <div className="tx-meta">
                            <span className="tx-cat-chip">{t.category}</span>
                            <span className="tx-dot-separator">•</span>
                            <span className="tx-date-chip">{t.date}</span>
                            {t.paymentMethod && (
                              <>
                                <span className="tx-dot-separator">•</span>
                                <span className="tx-method-chip">
                                  {t.paymentMethod}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="tx-amount-col">
                          <strong className={isPositive ? "positive" : "negative"}>
                            {isPositive ? "+" : "-"}
                            {currency}
                            {Math.abs(t.amount).toLocaleString("en-IN")}
                          </strong>
                          <button
                            className="tx-delete-inline"
                            onClick={() => handleDeleteTransaction(t.id)}
                            title="Remove transaction"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MONTHLY BUDGET SAFETY WIDGET */}
              <div className="panel budget-preview-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Monthly Budget Cap</h3>
                    <p>30-Day aggregate ceiling</p>
                  </div>
                  <div className="budget-status-pill safe">
                    <CheckCircle2 size={13} />
                    <span>On Track</span>
                  </div>
                </div>

                <div className="budget-gauge-block">
                  <div className="budget-values-row">
                    <h2>{formatMoney(totalExpenses)}</h2>
                    <span>of {currency}50,000 cap</span>
                  </div>

                  <div className="progress-track-sleek">
                    <div
                      className="progress-fill-sleek"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((totalExpenses / 50000) * 100)
                        )}%`
                      }}
                    />
                  </div>

                  <div className="budget-metrics-subrow">
                    <span>
                      {Math.round((totalExpenses / 50000) * 100)}% utilized
                    </span>
                    <span className="positive">
                      {currency}
                      {Math.max(0, 50000 - totalExpenses).toLocaleString("en-IN")}{" "}
                      buffer remaining
                    </span>
                  </div>
                </div>

                <div className="daily-safe-spend-box">
                  <div className="safe-spend-metric">
                    <span className="metric-title">Safe Daily Allowance</span>
                    <strong className="metric-val">{currency}1,180 / day</strong>
                  </div>
                  <div className="safe-spend-days">
                    <Calendar size={15} />
                    <span>24 Days Remaining</span>
                  </div>
                </div>

                <div className="budget-tip-banner">
                  <Sparkles size={16} />
                  <span>
                    Your burn rate is 14% below planned projections. Surplus will
                    auto-compound into savings.
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            VIEW: PERSONAL INPUTS (USER'S OWN FINANCIAL TELEMETRY)
           ======================================================== */}
        {active === "Personal Inputs" && (
          <PersonalInputs
            inputs={personalInputs}
            setInputs={setPersonalInputs}
            currency={currency}
            onApply={handleApplyPersonalInputs}
            showToast={showToast}
            formatMoney={formatMoney}
          />
        )}

        {/* ========================================================
            VIEW 2: TRANSACTIONS MANAGEMENT
           ======================================================== */}
        {active === "Transactions" && (
          <section className="transactions-page animate-fade-in">
            <div className="page-header-row">
              <div>
                <h2>Transaction Management</h2>
                <p>Categorize, audit, and export complete cash movements.</p>
              </div>

              <div className="page-actions-group">
                <button
                  className="secondary-btn"
                  onClick={handleExportCSV}
                  title="Export records to CSV"
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
                <button
                  className="primary-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={16} />
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-heading">Total Recorded Inflow</div>
                <h2 className="stat-amount positive">
                  +{currency}
                  {totalIncome.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="stat-card">
                <div className="stat-heading">Total Recorded Outflow</div>
                <h2 className="stat-amount negative">
                  -{currency}
                  {totalExpenses.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="stat-card">
                <div className="stat-heading">Net Monthly Delta</div>
                <h2 className="stat-amount accent">
                  {currency}
                  {netSavings.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="stat-card">
                <div className="stat-heading">Total Audit Entries</div>
                <h2 className="stat-amount">{transactions.length} records</h2>
              </div>
            </div>

            {/* FILTER & AUDIT LOG PANEL */}
            <div className="panel transaction-history-panel">
              <div className="audit-filter-bar">
                {/* TYPE TABS */}
                <div className="filter-type-pill-group">
                  {["All", "Income", "Expense"].map((type) => (
                    <button
                      key={type}
                      className={`filter-pill-btn ${txFilter === type ? "active" : ""}`}
                      onClick={() => setTxFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* CATEGORY DROPDOWN */}
                <select
                  className="filter-select"
                  value={txCategoryFilter}
                  onChange={(e) => setTxCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Food & Drinks">Food & Drinks</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Income">Income / Salary</option>
                  <option value="Housing">Housing</option>
                  <option value="Utilities">Utilities</option>
                </select>

                {/* SORT SELECT */}
                <select
                  className="filter-select"
                  value={txSort}
                  onChange={(e) => setTxSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>

              {/* TABLE */}
              <div className="tx-table-container">
                <div className="tx-table-header-row">
                  <span>DESCRIPTION</span>
                  <span>CATEGORY</span>
                  <span>DATE</span>
                  <span>PAYMENT METHOD</span>
                  <span>AMOUNT</span>
                  <span style={{ textAlign: "right" }}>ACTIONS</span>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="empty-state-box">
                    <Search size={32} />
                    <p>No transactions match your active search or filters.</p>
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setTxSearch("");
                        setTxFilter("All");
                        setTxCategoryFilter("All");
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredTransactions.map((item) => {
                    const Icon = getCategoryIcon(item.iconName);
                    const isPositive = item.amount > 0;
                    return (
                      <div className="tx-table-row" key={item.id}>
                        <div className="tx-name-cell">
                          <div
                            className={`tx-table-icon ${isPositive ? "inflow" : "outflow"}`}
                          >
                            <Icon size={16} />
                          </div>
                          <strong>{item.name}</strong>
                        </div>

                        <div>
                          <span className="category-pill-tag">{item.category}</span>
                        </div>

                        <div className="tx-date-cell">{item.date}</div>

                        <div>
                          <span className="payment-method-badge">
                            {item.paymentMethod || "Credit Card"}
                          </span>
                        </div>

                        <div className="tx-amount-cell">
                          <strong className={isPositive ? "positive" : "negative"}>
                            {isPositive ? "+" : "-"}
                            {currency}
                            {Math.abs(item.amount).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="tx-actions-cell">
                          <button
                            className="delete-icon-btn"
                            title="Delete transaction"
                            onClick={() => handleDeleteTransaction(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            VIEW 3: BUDGET PLANNER
           ======================================================== */}
        {active === "Budget Planner" && (
          <section className="budget-page animate-fade-in">
            <div className="page-header-row">
              <div>
                <h2>Budget Planner & Allocations</h2>
                <p>Establish category spending ceilings to prevent drift.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add Outflow</span>
              </button>
            </div>

            <div className="budget-overview-grid">
              {/* MAIN CEILING CARD */}
              <div className="panel budget-hero-card">
                <div className="budget-hero-info">
                  <div className="hero-budget-title">
                    <span>Aggregate Monthly Allocation</span>
                    <span className="safe-pill">Active Period: 01-30 Nov</span>
                  </div>
                  <h2>
                    {formatMoney(totalExpenses)}{" "}
                    <small>/ {currency}47,000</small>
                  </h2>
                  <p>
                    {Math.round((totalExpenses / 47000) * 100)}% of ceiling utilized
                    · Safe threshold maintained
                  </p>
                </div>

                <div className="progress-track-lg">
                  <div
                    className="progress-fill-lg"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((totalExpenses / 47000) * 100)
                      )}%`,
                      background: totalExpenses > 47000 ? "#f43f5e" : "#10b981"
                    }}
                  />
                </div>

                <div className="budget-metrics-triple">
                  <div className="metric-box">
                    <span className="metric-sublabel">Discretionary Buffer</span>
                    <strong className="positive">
                      {currency}
                      {Math.max(0, 47000 - totalExpenses).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="metric-box">
                    <span className="metric-sublabel">Cycle Remaining</span>
                    <strong>24 Days</strong>
                  </div>
                  <div className="metric-box">
                    <span className="metric-sublabel">Daily Run Rate Cap</span>
                    <strong>{currency}1,180 / day</strong>
                  </div>
                </div>
              </div>

              {/* AI DIAGNOSTIC ALERT */}
              <div className="panel ai-budget-alert-card">
                <div className="alert-card-header">
                  <div className="alert-icon-box">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3>AI Budget Diagnostic</h3>
                    <span>PACE WARNING</span>
                  </div>
                </div>
                <p className="alert-copy">
                  Food & Dining velocity has absorbed 70% of its allocation in
                  the first third of the calendar cycle. Restricting discretionary
                  takeout to {currency}1,200 on weekends preserves positive cash
                  flow.
                </p>
                <div className="alert-stat-box">
                  <span>Projected Month-End Variance:</span>
                  <strong className="positive">
                    Surplus of +{currency}4,200
                  </strong>
                </div>
              </div>
            </div>

            {/* CATEGORY BUDGETS LIST */}
            <div className="panel category-budgets-panel">
              <div className="panel-heading">
                <div>
                  <h3>Category Spending Ceilings</h3>
                  <p>Real-time spend tracking versus assigned category limits</p>
                </div>
              </div>

              <div className="category-budget-list">
                {budgets.map((b) => {
                  const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
                  const isHigh = percent >= 85;
                  const isModerate = percent >= 70 && percent < 85;

                  return (
                    <div className="category-budget-card" key={b.id}>
                      <div className="cat-budget-header">
                        <div className="cat-title-group">
                          <span
                            className="cat-color-dot"
                            style={{ background: b.color }}
                          />
                          <strong>{b.category}</strong>
                        </div>

                        <div className="cat-budget-values">
                          <span className={isHigh ? "negative" : ""}>
                            {currency}
                            {b.spent.toLocaleString("en-IN")}
                          </span>
                          <span className="cat-limit-text">
                            / {currency}
                            {b.limit.toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`badge-pill ${
                              isHigh
                                ? "badge-red"
                                : isModerate
                                ? "badge-amber"
                                : "badge-green"
                            }`}
                          >
                            {percent}%
                          </span>

                          <button
                            className="edit-limit-btn"
                            title="Adjust Category Limit"
                            onClick={() => {
                              setEditingBudget(b);
                              setIsBudgetModalOpen(true);
                            }}
                          >
                            <SlidersHorizontal size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="category-progress-track">
                        <div
                          className="category-progress-bar"
                          style={{
                            width: `${percent}%`,
                            background: isHigh ? "#f43f5e" : b.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            VIEW 4: ANALYTICS
           ======================================================== */}
        {active === "Analytics" && (
          <section className="analytics-page animate-fade-in">
            <div className="page-header-row">
              <div>
                <h2>Financial Analytics & Deep Dive</h2>
                <p>Categorical distributions, ratio benchmarks, and burn curves.</p>
              </div>
            </div>

            <div className="analytics-grid">
              {/* MONTHLY BAR COMPARISON */}
              <div className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Cash Flow Dynamics</h3>
                    <p>Inflow versus Outflow comparison by period</p>
                  </div>
                </div>

                <div className="chart-container" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataSets["6M"]}>
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        style={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        style={{ fontSize: 11 }}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                      />
                      <Tooltip content={<CustomChartTooltip currency={currency} />} />
                      <Bar
                        dataKey="income"
                        name="Income"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expenses"
                        name="Expenses"
                        fill="#a855f7"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CATEGORICAL BREAKDOWN */}
              <div className="panel category-breakdown-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Category Outflow Breakdown</h3>
                    <p>Actual spend vs planned ceiling</p>
                  </div>
                </div>

                <div className="breakdown-list">
                  {categorySpendData.map((item, idx) => (
                    <div className="breakdown-item" key={idx}>
                      <div className="breakdown-title-row">
                        <span className="breakdown-name">{item.category}</span>
                        <strong>
                          {currency}
                          {item.amount.toLocaleString("en-IN")}{" "}
                          <small className="muted-ratio">
                            ({Math.round((item.amount / (totalExpenses || 1)) * 100)}%)
                          </small>
                        </strong>
                      </div>
                      <div className="breakdown-progress-track">
                        <div
                          className="breakdown-progress-bar"
                          style={{
                            width: `${Math.round(
                              (item.amount / item.budget) * 100
                            )}%`,
                            background: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FINANCIAL RATIOS GRID */}
            <div className="stats-grid" style={{ marginTop: 24 }}>
              <div className="stat-card">
                <div className="stat-heading">Savings Ratio</div>
                <h2 className="stat-amount positive">
                  {Math.round((netSavings / (totalIncome || 1)) * 100)}%
                </h2>
                <div className="stat-footer">
                  <Award size={14} /> Benchmark: &gt; 30% is High Tier
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-heading">Daily Burn Rate</div>
                <h2 className="stat-amount">{currency}948 / day</h2>
                <div className="stat-footer">
                  <Activity size={14} /> Controlled velocity
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-heading">Largest Fixed Outflow</div>
                <h2 className="stat-amount">Housing (35%)</h2>
                <div className="stat-footer">Essential non-negotiable</div>
              </div>

              <div className="stat-card">
                <div className="stat-heading">Discretionary Ratio</div>
                <h2 className="stat-amount positive">22%</h2>
                <div className="stat-footer">
                  <Shield size={14} /> Safe ceiling is &lt; 30%
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            VIEW 5: AI ASSISTANT CO-PILOT
           ======================================================== */}
        {active === "AI Assistant" && (
          <section className="ai-assistant-page animate-fade-in">
            <div className="page-header-row">
              <div>
                <h2>Finora Intelligence Co-Pilot</h2>
                <p>Autonomous financial advisor powered by your real telemetry.</p>
              </div>

              <div className="ai-status-pill-active">
                <span className="live-pulsing-dot" />
                <span>Co-Pilot Active · Model v3.2</span>
              </div>
            </div>

            <div className="ai-layout-container">
              {/* CHAT PANEL */}
              <div className="panel chat-panel-container">
                <div className="chat-messages-scroll">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`chat-bubble-row ${
                        m.sender === "user" ? "user-row" : "ai-row"
                      }`}
                    >
                      {m.sender === "ai" && (
                        <div className="ai-avatar-bubble">
                          <Bot size={18} />
                        </div>
                      )}

                      <div
                        className={`chat-bubble-content ${
                          m.sender === "user" ? "user-bubble" : "ai-bubble"
                        }`}
                      >
                        <p style={{ whiteSpace: "pre-line" }}>{m.text}</p>
                        <div className="message-meta-row">
                          <span className="message-time">{m.timestamp}</span>
                          {m.sender === "ai" && (
                            <button
                              className="copy-msg-btn"
                              onClick={() => handleCopyMessage(m.id, m.text)}
                              title="Copy advice snippet"
                            >
                              {copiedMessageId === m.id ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAiTyping && (
                    <div className="chat-bubble-row ai-row">
                      <div className="ai-avatar-bubble">
                        <Bot size={18} />
                      </div>
                      <div className="chat-bubble-content ai-bubble typing-bubble">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  )}
                </div>

                {/* SUGGESTION PILLS */}
                <div className="prompt-suggestions-row">
                  <button
                    onClick={() =>
                      handleSendMessage("Review my personal inputs and suggest an optimization plan")
                    }
                  >
                    👤 Review my personal inputs
                  </button>
                  <button
                    onClick={() =>
                      handleSendMessage("How can I save ₹10,000 more this month?")
                    }
                  >
                    💡 Save {currency}10,000 more
                  </button>
                  <button
                    onClick={() =>
                      handleSendMessage("Analyze my spending pattern and category risks")
                    }
                  >
                    📊 Analyze spending pattern
                  </button>
                  <button
                    onClick={() =>
                      handleSendMessage("What is my Financial Health Score breakdown?")
                    }
                  >
                    ❤️ Health Score breakdown
                  </button>
                  <button
                    onClick={() =>
                      handleSendMessage("How are my savings goals progressing towards deadline?")
                    }
                  >
                    🎯 Savings goals check
                  </button>
                </div>

                {/* INPUT BAR */}
                <form
                  className="chat-input-bar-modern"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ask Finora AI about cash flow, budgets, tax, or investment sweeps..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="send-message-btn"
                    disabled={isAiTyping || !chatInput.trim()}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

              {/* SIDE SUMMARY */}
              <div className="ai-side-summary">
                <div className="panel ai-telemetry-sidebar">
                  <div className="telemetry-header">
                    <Sparkles size={18} className="text-emerald" />
                    <h4>Portfolio Telemetry</h4>
                  </div>

                  <div className="telemetry-stat-card">
                    <span>Financial Health Score</span>
                    <div className="telemetry-score-row">
                      <h3>82</h3>
                      <small>/ 100</small>
                      <span className="telemetry-tag">Strong</span>
                    </div>
                  </div>

                  <div className="telemetry-items-list">
                    <div className="telemetry-item">
                      <span>Monthly Net Surplus</span>
                      <strong className="positive">
                        +{currency}
                        {netSavings.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div className="telemetry-item">
                      <span>Daily Safe Allocation</span>
                      <strong>{currency}1,180 / day</strong>
                    </div>
                    <div className="telemetry-item">
                      <span>Debt-to-Income</span>
                      <strong className="positive">0% (Zero Debt)</strong>
                    </div>
                    <div className="telemetry-item">
                      <span>Emergency Runway</span>
                      <strong>4.8 Months</strong>
                    </div>
                  </div>

                  <div className="telemetry-tip-box">
                    <Sparkles size={15} />
                    <p>
                      <strong>Auto-Sweep Ready:</strong> Diverting positive month-end
                      surplus into an index fund will generate an extra ~
                      {currency}14,200 annually.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            VIEW 6: SAVINGS GOALS
           ======================================================== */}
        {active === "Savings Goals" && (
          <section className="goals-page animate-fade-in">
            <div className="page-header-row">
              <div>
                <h2>Savings Goals & Milestones</h2>
                <p>Compound capital towards critical life milestones.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setIsGoalModalOpen(true)}
              >
                <Plus size={16} />
                <span>Create New Goal</span>
              </button>
            </div>

            <div className="goals-grid">
              {goals.map((g) => {
                const percent = Math.min(
                  100,
                  Math.round((g.current / g.target) * 100)
                );
                const remaining = Math.max(0, g.target - g.current);

                return (
                  <div className="panel goal-card-elevated" key={g.id}>
                    <div className="goal-card-top">
                      <div className="goal-title-wrapper">
                        <div
                          className="goal-icon-badge"
                          style={{
                            background: `${g.color}20`,
                            color: g.color
                          }}
                        >
                          <PiggyBank size={20} />
                        </div>
                        <div>
                          <h3>{g.title}</h3>
                          <span className="goal-deadline-label">
                            Target: {g.deadline}
                          </span>
                        </div>
                      </div>
                      <span
                        className="goal-percent-pill"
                        style={{
                          background: `${g.color}20`,
                          color: g.color
                        }}
                      >
                        {percent}%
                      </span>
                    </div>

                    <div className="goal-amount-row">
                      <h2>
                        {currency}
                        {g.current.toLocaleString("en-IN")}
                      </h2>
                      <span>
                        target of {currency}
                        {g.target.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="goal-progress-track">
                      <div
                        className="goal-progress-fill"
                        style={{
                          width: `${percent}%`,
                          background: g.color
                        }}
                      />
                    </div>

                    <div className="goal-footer-actions">
                      <span className="goal-remaining-text">
                        {currency}
                        {remaining.toLocaleString("en-IN")} remaining
                      </span>

                      <button
                        className="deposit-funds-btn"
                        onClick={() => {
                          setContributeGoal(g);
                          setDepositAmount(2500);
                        }}
                      >
                        <Plus size={14} />
                        <span>Deposit Funds</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            VIEW 7: SETTINGS & PREFERENCES
           ======================================================== */}
        {active === "Settings" && (
          <section className="settings-page animate-fade-in">
            <div className="page-header-row">
              <div>
                <h2>System Settings & Preferences</h2>
                <p>Configure telemetry, multi-currency display, and automation triggers.</p>
              </div>
            </div>

            <div className="settings-grid-layout">
              {/* USER PROFILE */}
              <div className="panel settings-card">
                <h3>User Profile & Identity</h3>
                <p>Configure personal credentials</p>

                <div className="settings-form-group">
                  <div className="form-field">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setPersonalInputs((prev) => ({
                          ...prev,
                          fullName: e.target.value
                        }));
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                        setPersonalInputs((prev) => ({
                          ...prev,
                          email: e.target.value
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* CURRENCY & FORMATTING */}
              <div className="panel settings-card">
                <h3>Monetary Unit</h3>
                <p>Choose your default currency representation</p>

                <div className="currency-selector-grid">
                  {[
                    { symbol: "₹", name: "INR (Rupee)" },
                    { symbol: "$", name: "USD (Dollar)" },
                    { symbol: "€", name: "EUR (Euro)" },
                    { symbol: "£", name: "GBP (Pound)" }
                  ].map((curr) => (
                    <button
                      key={curr.symbol}
                      className={`currency-pill-btn ${
                        currency === curr.symbol ? "active" : ""
                      }`}
                      onClick={() => {
                        setCurrency(curr.symbol);
                        showToast("Currency Changed", `Active unit updated to ${curr.name}.`);
                      }}
                    >
                      <strong className="curr-symbol">{curr.symbol}</strong>
                      <small className="curr-label">{curr.name}</small>
                    </button>
                  ))}
                </div>
              </div>

              {/* THEME ACCENT */}
              <div className="panel settings-card">
                <h3>Atmospheric Theme Accent</h3>
                <p>Customize dashboard lighting & glow accent</p>

                <div className="theme-selector-row">
                  {[
                    { id: "emerald", label: "Emerald Neon", color: "#10b981" },
                    { id: "cyan", label: "Electric Cyan", color: "#06b6d4" },
                    { id: "violet", label: "Amethyst Violet", color: "#8b5cf6" },
                    { id: "amber", label: "Gold Amber", color: "#f59e0b" }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-pill-btn ${
                        themeAccent === theme.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setThemeAccent(theme.id);
                        showToast("Theme Accent Updated", `${theme.label} active.`);
                      }}
                    >
                      <span
                        className="theme-dot"
                        style={{ background: theme.color }}
                      />
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AUTOMATION & ALERTS */}
              <div className="panel settings-card">
                <h3>Automation & Proactive Triggers</h3>
                <p>Manage background intelligence monitors</p>

                <div className="toggle-switches-list">
                  <label className="toggle-row">
                    <div>
                      <strong>Budget Ceiling Alerts</strong>
                      <span>Push alert when any category crosses 80% ceiling</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={budgetAlerts}
                      onChange={(e) => setBudgetAlerts(e.target.checked)}
                    />
                  </label>

                  <label className="toggle-row">
                    <div>
                      <strong>AI Smart Suggestions</strong>
                      <span>Receive weekly autonomous expense optimization tips</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSuggestions}
                      onChange={(e) => setAiSuggestions(e.target.checked)}
                    />
                  </label>

                  <label className="toggle-row">
                    <div>
                      <strong>Weekly Digest Telemetry</strong>
                      <span>Audit digest generated every Sunday night</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={weeklyReports}
                      onChange={(e) => setWeeklyReports(e.target.checked)}
                    />
                  </label>

                  <label className="toggle-row">
                    <div>
                      <strong>Automated Surplus Sweep</strong>
                      <span>Auto-deposit month-end positive delta to High Yield</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSweep}
                      onChange={(e) => setAutoSweep(e.target.checked)}
                    />
                  </label>
                </div>
              </div>

              {/* DATA INTEGRITY & BACKUP */}
              <div className="panel settings-card" style={{ gridColumn: "1 / -1" }}>
                <h3>Data Export & Portability</h3>
                <p>Download full transaction history or JSON system backup</p>

                <div className="export-actions-row">
                  <button className="primary-btn" onClick={handleExportCSV}>
                    <Download size={16} />
                    <span>Export CSV File</span>
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => {
                      const backup = {
                        user: { userName, userEmail, currency },
                        transactions,
                        goals,
                        budgets,
                        exportedAt: new Date().toISOString()
                      };
                      const dataStr =
                        "data:text/json;charset=utf-8," +
                        encodeURIComponent(JSON.stringify(backup, null, 2));
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute(
                        "download",
                        `finora_backup_${Date.now()}.json`
                      );
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      showToast("Backup Generated", "Full system state exported as JSON.");
                    }}
                  >
                    <Layers size={16} />
                    <span>Download JSON Snapshot</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            MODAL 1: ADD TRANSACTION
           ======================================================== */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div
              className="modal-card animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-box">
                  <h3>Record New Transaction</h3>
                  <p>Inflow or expenditure ledger entry</p>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="modal-form">
                {/* TRANSACTION TYPE TOGGLE */}
                <div className="tx-type-toggle-bar">
                  <button
                    type="button"
                    className={`tx-type-btn ${
                      newTx.type === "expense" ? "active-expense" : ""
                    }`}
                    onClick={() => setNewTx({ ...newTx, type: "expense" })}
                  >
                    Expense (Outflow)
                  </button>
                  <button
                    type="button"
                    className={`tx-type-btn ${
                      newTx.type === "income" ? "active-income" : ""
                    }`}
                    onClick={() => setNewTx({ ...newTx, type: "income" })}
                  >
                    Income (Inflow)
                  </button>
                </div>

                <div className="form-field">
                  <label>Description / Merchant</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Whole Foods, Freelance Retainer"
                    value={newTx.name}
                    onChange={(e) =>
                      setNewTx({ ...newTx, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={newTx.amount}
                    onChange={(e) =>
                      setNewTx({ ...newTx, amount: e.target.value })
                    }
                  />
                </div>

                <div className="form-row-dual">
                  <div className="form-field">
                    <label>Category</label>
                    <select
                      value={newTx.category}
                      onChange={(e) =>
                        setNewTx({ ...newTx, category: e.target.value })
                      }
                    >
                      <option value="Food & Drinks">Food & Drinks</option>
                      <option value="Shopping">Shopping & Retail</option>
                      <option value="Housing">Housing & Rent</option>
                      <option value="Utilities">Utilities & Bills</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Income">Salary / Freelance</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Payment Method</label>
                    <select
                      value={newTx.paymentMethod}
                      onChange={(e) =>
                        setNewTx({ ...newTx, paymentMethod: e.target.value })
                      }
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Apple Pay">Apple Pay / UPI</option>
                      <option value="Direct Deposit">Direct Deposit</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer-row">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 2: DEPOSIT FUNDS TO GOAL
           ======================================================== */}
        {contributeGoal && (
          <div className="modal-backdrop" onClick={() => setContributeGoal(null)}>
            <div
              className="modal-card animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-box">
                  <h3>Deposit to "{contributeGoal.title}"</h3>
                  <p>
                    Current progress: {currency}
                    {contributeGoal.current.toLocaleString()} of {currency}
                    {contributeGoal.target.toLocaleString()}
                  </p>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setContributeGoal(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="deposit-chips-row">
                {[1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`deposit-chip ${
                      depositAmount === amt ? "active" : ""
                    }`}
                    onClick={() => setDepositAmount(amt)}
                  >
                    +{currency}
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="form-field" style={{ marginTop: 14 }}>
                <label>Custom Contribution Amount ({currency})</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                />
              </div>

              <div className="deposit-projection-box">
                <Sparkles size={16} />
                <span>
                  This deposit will increase your milestone progress to{" "}
                  <strong>
                    {Math.min(
                      100,
                      Math.round(
                        ((contributeGoal.current + Number(depositAmount)) /
                          contributeGoal.target) *
                          100
                      )
                    )}
                    %
                  </strong>
                  .
                </span>
              </div>

              <div className="modal-footer-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setContributeGoal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleConfirmDeposit}
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 3: CREATE NEW GOAL
           ======================================================== */}
        {isGoalModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsGoalModalOpen(false)}>
            <div
              className="modal-card animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-box">
                  <h3>Create Savings Goal</h3>
                  <p>Target a capital allocation milestone</p>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsGoalModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="modal-form">
                <div className="form-field">
                  <label>Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Home Deposit, Dream Bike"
                    value={newGoalForm.title}
                    onChange={(e) =>
                      setNewGoalForm({ ...newGoalForm, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Target Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={newGoalForm.target}
                    onChange={(e) =>
                      setNewGoalForm({ ...newGoalForm, target: e.target.value })
                    }
                  />
                </div>

                <div className="form-row-dual">
                  <div className="form-field">
                    <label>Target Deadline</label>
                    <input
                      type="text"
                      placeholder="e.g. Dec 2027"
                      value={newGoalForm.deadline}
                      onChange={(e) =>
                        setNewGoalForm({
                          ...newGoalForm,
                          deadline: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Category</label>
                    <select
                      value={newGoalForm.category}
                      onChange={(e) =>
                        setNewGoalForm({
                          ...newGoalForm,
                          category: e.target.value
                        })
                      }
                    >
                      <option value="Security">Security & Emergency</option>
                      <option value="Hardware">Hardware / Gadgets</option>
                      <option value="Travel">Travel / Vacation</option>
                      <option value="Wealth">Investments & Wealth</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Accent Color</label>
                  <div className="color-picker-row">
                    {["#10b981", "#38bdf8", "#a855f7", "#f59e0b", "#ec4899"].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          className={`color-swatch-btn ${
                            newGoalForm.color === c ? "active" : ""
                          }`}
                          style={{ background: c }}
                          onClick={() =>
                            setNewGoalForm({ ...newGoalForm, color: c })
                          }
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="modal-footer-row">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsGoalModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 4: EDIT BUDGET CEILING
           ======================================================== */}
        {isBudgetModalOpen && editingBudget && (
          <div
            className="modal-backdrop"
            onClick={() => setIsBudgetModalOpen(false)}
          >
            <div
              className="modal-card animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-box">
                  <h3>Adjust Category Budget</h3>
                  <p>{editingBudget.category}</p>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsBudgetModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveBudgetLimit} className="modal-form">
                <div className="form-field">
                  <label>Current Spent</label>
                  <input
                    type="text"
                    disabled
                    value={`${currency}${editingBudget.spent.toLocaleString()}`}
                  />
                </div>

                <div className="form-field">
                  <label>New Monthly Limit ({currency})</label>
                  <input
                    type="number"
                    required
                    value={editingBudget.limit}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        limit: Number(e.target.value)
                      })
                    }
                  />
                </div>

                <div className="modal-footer-row">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsBudgetModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Save Limit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 5: FINANCIAL HEALTH AUDIT BREAKDOWN
           ======================================================== */}
        {healthModalOpen && (
          <div
            className="modal-backdrop"
            onClick={() => setHealthModalOpen(false)}
          >
            <div
              className="modal-card health-audit-modal animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-box">
                  <div className="health-modal-badge">
                    <Shield size={16} />
                    <span>DIAGNOSTIC AUDIT</span>
                  </div>
                  <h3>Financial Health Breakdown</h3>
                  <p>Comprehensive telemetry scorecard</p>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setHealthModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="health-audit-summary-hero">
                <div className="hero-radial-circle">
                  <span>82</span>
                  <small>/100</small>
                </div>
                <div className="hero-audit-copy">
                  <h4>Prime Tier Health Score</h4>
                  <p>
                    Your overall cash flow, asset allocation, and low leverage
                    place your profile in the top 12% of disciplined savers this
                    quarter.
                  </p>
                </div>
              </div>

              <div className="audit-dimensions-list">
                <div className="audit-dimension">
                  <div className="dimension-title-row">
                    <span>1. Savings Velocity</span>
                    <strong>28 / 30 pts (Excellent)</strong>
                  </div>
                  <div className="dimension-bar">
                    <div className="dimension-fill" style={{ width: "93%" }} />
                  </div>
                </div>

                <div className="audit-dimension">
                  <div className="dimension-title-row">
                    <span>2. Debt & Leverage</span>
                    <strong>25 / 25 pts (Perfect)</strong>
                  </div>
                  <div className="dimension-bar">
                    <div className="dimension-fill" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="audit-dimension">
                  <div className="dimension-title-row">
                    <span>3. Budget Adherence</span>
                    <strong>19 / 25 pts (Good)</strong>
                  </div>
                  <div className="dimension-bar">
                    <div className="dimension-fill" style={{ width: "76%" }} />
                  </div>
                </div>

                <div className="audit-dimension">
                  <div className="dimension-title-row">
                    <span>4. Emergency Runway</span>
                    <strong>10 / 20 pts (4.8 months runway)</strong>
                  </div>
                  <div className="dimension-bar">
                    <div className="dimension-fill" style={{ width: "50%" }} />
                  </div>
                </div>
              </div>

              <div className="audit-recommendation-box">
                <Sparkles size={16} />
                <p>
                  <strong>Primary Recommendation:</strong> Direct upcoming
                  contract bonus ({currency}22,000) straight into your Emergency
                  Fund to elevate this pillar to 6 full months of reserves.
                </p>
              </div>

              <div className="modal-footer-row">
                <button
                  type="button"
                  className="primary-btn"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setHealthModalOpen(false);
                    handleNavClick("AI Assistant");
                  }}
                >
                  Discuss Action Plan with AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <span>FINORA AI © 2026 · Autonomous Financial Management System</span>
          <span className="footer-dot">•</span>
          <span>End-to-End Encrypted Telemetry</span>
          <span className="footer-dot">•</span>
          <span>Model v3.2 Active</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
