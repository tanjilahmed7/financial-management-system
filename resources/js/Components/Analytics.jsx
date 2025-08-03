import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/Card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/Chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import {
    BarChart3,
    PieChart as PieChartIcon,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";

const COLORS = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
];

export function Analytics({ transactions, accounts }) {
    console.log("Analytics component rendered with:", {
        transactions: transactions.length,
        accounts: accounts.length,
    });
    const [period, setPeriod] = useState("30");

    // Filter transactions by period (only expenses for category chart)
    const filterTransactionsByPeriod = (days) => {
        const today = new Date();
        let cutoffDate;

        if (days === "current-month") {
            cutoffDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (days === "ytd") {
            cutoffDate = new Date(today.getFullYear(), 0, 1);
        } else {
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
        }

        return transactions.filter((t) => new Date(t.date) >= cutoffDate);
    };

    const filteredTransactions = filterTransactionsByPeriod(
        period === "current-month" || period === "ytd"
            ? period
            : parseInt(period)
    );
    const expenseTransactions = filteredTransactions.filter(
        (t) => t.amount < 0 && t.category !== "Transfer"
    );

    // Category spending data (excluding transfers)
    const categoryData = expenseTransactions.reduce((acc, transaction) => {
        const category = transaction.category;
        const amount = Math.abs(transaction.amount);
        acc[category] = (acc[category] || 0) + amount;
        return acc;
    }, {});

    const categoryChartData = Object.entries(categoryData)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

    // Account spending data
    const accountData = expenseTransactions.reduce((acc, transaction) => {
        const account = transaction.account;
        const amount = Math.abs(transaction.amount);
        acc[account] = (acc[account] || 0) + amount;
        return acc;
    }, {});

    const accountChartData = Object.entries(accountData)
        .map(([account, amount]) => ({ account, amount }))
        .sort((a, b) => b.amount - a.amount);

    // Cash flow data (daily totals)
    const cashFlowData = filteredTransactions.reduce((acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
            acc[date] = { date, income: 0, expenses: 0, net: 0 };
        }
        if (transaction.amount > 0) {
            acc[date].income += transaction.amount;
        } else {
            acc[date].expenses += Math.abs(transaction.amount);
        }
        acc[date].net = acc[date].income - acc[date].expenses;
        return acc;
    }, {});

    const cashFlowChartData = Object.values(cashFlowData).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const totalExpenses = expenseTransactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
    );
    const totalIncome = filteredTransactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;

    // Check if there's any data for the selected period
    const hasData = filteredTransactions.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                    Financial Analytics
                </h2>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last Week</SelectItem>
                        <SelectItem value="14">Last 2 Weeks</SelectItem>
                        <SelectItem value="30">Last Month</SelectItem>
                        <SelectItem value="current-month">
                            Current Month
                        </SelectItem>
                        <SelectItem value="60">Last 2 Months</SelectItem>
                        <SelectItem value="90">Last Quarter</SelectItem>
                        <SelectItem value="180">Last 6 Months</SelectItem>
                        <SelectItem value="365">Last Year</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Expenses
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-pastel-pink-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-pastel-pink-foreground">
                            $
                            {totalExpenses.toLocaleString("en-CA", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Income
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-pastel-green-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-pastel-green-foreground">
                            $
                            {totalIncome.toLocaleString("en-CA", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Net Cash Flow
                        </CardTitle>
                        {netCashFlow >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-pastel-green-foreground" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-pastel-pink-foreground" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${
                                netCashFlow >= 0
                                    ? "text-pastel-green-foreground"
                                    : "text-pastel-pink-foreground"
                            }`}
                        >
                            $
                            {netCashFlow.toLocaleString("en-CA", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid or No Data Message */}
            {!hasData ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="text-center space-y-4">
                            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
                            <h3 className="text-xl font-semibold text-foreground">
                                No Data Available
                            </h3>
                            <p className="text-muted-foreground max-w-md">
                                There is no transaction data for the selected
                                period. If you wish to see analytics visuals,
                                please select a date range that has transaction
                                data in it.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Spending Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Spending by Category
                                </CardTitle>
                                <CardDescription>
                                    Breakdown of expenses for the selected
                                    period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {categoryChartData.length > 0 ? (
                                    <ChartContainer
                                        config={{
                                            amount: {
                                                label: "Amount",
                                            },
                                        }}
                                        className="h-[300px]"
                                    >
                                        <>
                                            <style>{`.recharts-pie-label-text { fill: #000000 !important; font-size: 12px; }`}</style>
                                            <PieChart width={500} height={300}>
                                                <Pie
                                                    data={categoryChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    dataKey="amount"
                                                    label={({
                                                        category,
                                                        percent,
                                                    }) =>
                                                        `${category} ${(
                                                            percent * 100
                                                        ).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {categoryChartData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    COLORS[
                                                                        index %
                                                                            COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <ChartTooltip
                                                    content={
                                                        <ChartTooltipContent />
                                                    }
                                                    formatter={(value) => [
                                                        `$${value.toFixed(2)}`,
                                                        "Amount",
                                                    ]}
                                                />
                                            </PieChart>
                                        </>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                        <p>
                                            No expense data available for this
                                            period
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Account Spending Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Spending by Account
                                </CardTitle>
                                <CardDescription>
                                    Breakdown of expenses by account for the
                                    selected period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {accountChartData.length > 0 ? (
                                    <ChartContainer
                                        config={{
                                            amount: {
                                                label: "Amount",
                                            },
                                        }}
                                        className="h-[300px]"
                                    >
                                        <>
                                            <style>{`.recharts-pie-label-text { fill: #000000 !important; font-size: 12px; }`}</style>
                                            <PieChart width={500} height={300}>
                                                <Pie
                                                    data={accountChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    dataKey="amount"
                                                    label={({
                                                        account,
                                                        percent,
                                                    }) =>
                                                        `${account} ${(
                                                            percent * 100
                                                        ).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {accountChartData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    COLORS[
                                                                        index %
                                                                            COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <ChartTooltip
                                                    content={
                                                        <ChartTooltipContent />
                                                    }
                                                    formatter={(value) => [
                                                        `$${value.toFixed(2)}`,
                                                        "Amount",
                                                    ]}
                                                />
                                            </PieChart>
                                        </>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                        <p>
                                            No expense data available for this
                                            period
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cash Flow Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Daily Cash Flow Trends
                            </CardTitle>
                            <CardDescription>
                                Daily income vs expenses and net cash flow
                                trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cashFlowChartData.length > 0 ? (
                                <ChartContainer
                                    config={{
                                        income: {
                                            label: "Income",
                                            color: "#10b981",
                                        },
                                        expenses: {
                                            label: "Expenses",
                                            color: "#ef4444",
                                        },
                                        net: {
                                            label: "Net Cash Flow",
                                            color: "#3b82f6",
                                        },
                                    }}
                                    className="h-[400px]"
                                >
                                    <LineChart
                                        data={cashFlowChartData}
                                        width={700}
                                        height={400}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                            formatter={(value, name) => [
                                                `$${Math.abs(value).toFixed(
                                                    2
                                                )}`,
                                                name === "expenses"
                                                    ? "Expenses"
                                                    : name === "income"
                                                    ? "Income"
                                                    : "Net Cash Flow",
                                            ]}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{
                                                fill: "#10b981",
                                                strokeWidth: 2,
                                                r: 4,
                                            }}
                                            name="Income"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="expenses"
                                            stroke="#ef4444"
                                            strokeWidth={3}
                                            dot={{
                                                fill: "#ef4444",
                                                strokeWidth: 2,
                                                r: 4,
                                            }}
                                            name="Expenses"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="net"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{
                                                fill: "#3b82f6",
                                                strokeWidth: 2,
                                                r: 4,
                                            }}
                                            name="Net Cash Flow"
                                        />
                                    </LineChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                                    <p>
                                        No transaction data available for this
                                        period
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
