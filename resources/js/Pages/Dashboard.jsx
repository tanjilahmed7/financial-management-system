import { AccountCard } from "@/Components/AccountCard";
import { Analytics } from "@/Components/Analytics";
import { CategoryManager } from "@/Components/CategoryManager";
import { Header } from "@/Components/Header";
import { TransactionsList } from "@/Components/TransactionsList";
import { Button } from "@/Components/ui/Button";
import { Calendar } from "@/Components/ui/Calendar";
import { Checkbox } from "@/Components/ui/Checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/Dialog";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/Popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import axios from "@/lib/axios";
import { Head } from "@inertiajs/react";
import { format } from "date-fns";
import {
    BarChart3,
    Calendar as CalendarIcon,
    Filter,
    List,
    LogOut,
    Plus,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard({
    accounts,
    categories,
    transactions,
    currentMessage,
    user,
}) {
    const [transactionsList, setTransactionsList] = useState(transactions);
    const [accountsList, setAccountsList] = useState(accounts);
    const [categoriesList, setCategoriesList] = useState(categories);
    const [accountFilter, setAccountFilter] = useState("ALL");
    const [activeView, setActiveView] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdatingBalances, setIsUpdatingBalances] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [newTransaction, setNewTransaction] = useState({
        description: "",
        amount: "",
        category: "",
        account: "",
        fromAccount: "",
        toAccount: "",
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        transactionType: "expense",
        isRecurring: false,
        recurringFrequency: "monthly",
    });

    // Filter transactions by account
    const filteredTransactions =
        accountFilter === "ALL"
            ? transactionsList
            : transactionsList.filter((t) => t.account === accountFilter);

    // Calculate total balance
    const totalBalance = accountsList.reduce(
        (sum, account) => sum + account.balance,
        0
    );

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    // Get account options for filter
    const accountOptions = [
        "ALL",
        ...accountsList.map((account) => account.name),
    ];

    const handleAddTransaction = async () => {
        // Validation based on transaction type
        if (newTransaction.transactionType === "transfer") {
            if (
                !newTransaction.description ||
                !newTransaction.amount ||
                !newTransaction.fromAccount ||
                !newTransaction.toAccount
            ) {
                return;
            }

            if (newTransaction.fromAccount === newTransaction.toAccount) {
                return; // Cannot transfer to same account
            }
        } else {
            if (
                !newTransaction.description ||
                !newTransaction.amount ||
                !newTransaction.category ||
                !newTransaction.account
            ) {
                return;
            }
        }

        const numAmount = parseFloat(newTransaction.amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return;
        }

        const finalAmount =
            newTransaction.transactionType === "expense"
                ? -Math.abs(numAmount)
                : Math.abs(numAmount);

        try {
            // Find category and account IDs
            const categoryId = categoriesList.find(
                (cat) => cat.name === newTransaction.category
            )?.id;
            const accountId = accountsList.find(
                (acc) => acc.name === newTransaction.account
            )?.id;

            if (!categoryId || !accountId) {
                console.error("Category or account not found");
                console.error("Category:", newTransaction.category);
                console.error("Account:", newTransaction.account);
                console.error("Available categories:", categoriesList);
                console.error("Available accounts:", accountsList);
                return;
            }

            const requestData = {
                description: newTransaction.description,
                amount: finalAmount,
                category_id: categoryId,
                account_id: accountId,
                date: newTransaction.date,
                status: newTransaction.status,
                type: newTransaction.transactionType,
                is_recurring: newTransaction.isRecurring,
                recurring_frequency: newTransaction.isRecurring
                    ? newTransaction.recurringFrequency
                    : null,
            };

            console.log("Sending transaction data:", requestData);

            const response = await axios.post("/api/transactions", requestData);

            // Add the new transaction to the list
            const newTransactionData = response.data.data;
            setTransactionsList([newTransactionData, ...transactionsList]);

            // Refresh account balances with a small delay to ensure DB commit
            setTimeout(async () => {
                await refreshAccountBalances();
            }, 100);

            // Reset form
            setNewTransaction({
                description: "",
                amount: "",
                category: "",
                account: "",
                fromAccount: "",
                toAccount: "",
                date: new Date().toISOString().split("T")[0],
                status: "pending",
                transactionType: "expense",
                isRecurring: false,
                recurringFrequency: "monthly",
            });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error adding transaction:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
            alert("Failed to add transaction. Please try again.");
        }
    };

    const handleUpdateTransactionStatus = async (id, status) => {
        try {
            await axios.patch(`/api/transactions/${id}/status`, { status });
            setTransactionsList(
                transactionsList.map((t) =>
                    t.id === id ? { ...t, status } : t
                )
            );

            // Refresh account balances after status change with a small delay
            setTimeout(async () => {
                await refreshAccountBalances();
            }, 100);
        } catch (error) {
            console.error("Error updating transaction status:", error);
            alert("Failed to update transaction status. Please try again.");
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await axios.delete(`/api/transactions/${id}`);
            setTransactionsList(transactionsList.filter((t) => t.id !== id));

            // Refresh account balances after deletion with a small delay
            setTimeout(async () => {
                await refreshAccountBalances();
            }, 100);
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Failed to delete transaction. Please try again.");
        }
    };

    const handleUpdateCategories = (newCategories) => {
        setCategoriesList(newCategories);
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction({
            id: transaction.id,
            description: transaction.description,
            amount: Math.abs(transaction.amount).toString(),
            category: transaction.category,
            account: transaction.account,
            date: transaction.date,
            status: transaction.status,
            transactionType: transaction.amount >= 0 ? "income" : "expense",
            isRecurring: transaction.is_recurring || false,
            recurringFrequency: transaction.recurring_frequency || "monthly",
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateTransaction = async () => {
        if (!editingTransaction) return;

        const numAmount = parseFloat(editingTransaction.amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return;
        }

        const finalAmount =
            editingTransaction.transactionType === "expense"
                ? -Math.abs(numAmount)
                : Math.abs(numAmount);

        try {
            // Find category and account IDs
            const categoryId = categoriesList.find(
                (cat) => cat.name === editingTransaction.category
            )?.id;
            const accountId = accountsList.find(
                (acc) => acc.name === editingTransaction.account
            )?.id;

            if (!categoryId || !accountId) {
                console.error("Category or account not found");
                return;
            }

            const requestData = {
                description: editingTransaction.description,
                amount: finalAmount,
                category_id: categoryId,
                account_id: accountId,
                date: editingTransaction.date,
                status: editingTransaction.status,
                type: editingTransaction.transactionType,
                is_recurring: editingTransaction.isRecurring,
                recurring_frequency: editingTransaction.isRecurring
                    ? editingTransaction.recurringFrequency
                    : null,
            };

            const response = await axios.put(
                `/api/transactions/${editingTransaction.id}`,
                requestData
            );

            const updatedTransactionData = response.data.data;
            setTransactionsList(
                transactionsList.map((t) =>
                    t.id === editingTransaction.id ? updatedTransactionData : t
                )
            );

            // Refresh account balances
            setTimeout(async () => {
                await refreshAccountBalances();
            }, 100);

            // Reset form and close modal
            setEditingTransaction(null);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating transaction:", error);
            alert("Failed to update transaction. Please try again.");
        }
    };

    // Helper function to refresh account balances
    const refreshAccountBalances = async () => {
        try {
            setIsUpdatingBalances(true);
            const accountsResponse = await axios.get("/api/accounts");
            const updatedAccounts = accountsResponse.data.data;
            setAccountsList(updatedAccounts);
        } catch (error) {
            console.error("Error refreshing accounts:", error);
        } finally {
            setIsUpdatingBalances(false);
        }
    };

    // Get user's first name
    const firstName = user?.name?.split(" ")[0] || "demo";

    return (
        <>
            <Head title="Financial Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
                <Header user={user} />
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Welcome Section */}
                    <div className="mb-6">
                        <div className="bg-dark-blue rounded-lg p-4 text-dark-blue-foreground shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-dark-blue-foreground/20 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold text-dark-blue">
                                            {firstName
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-semibold mb-1">
                                            Hi {firstName}! 👋
                                        </h1>
                                        <p className="text-sm opacity-90">
                                            {currentMessage}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm opacity-90">
                                            Current Cash Position
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(totalBalance)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                (window.location.href =
                                                    route("logout"))
                                            }
                                            className="text-dark-blue-foreground/70 hover:text-dark-blue-foreground transition-colors p-1"
                                            title="Sign Out"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {accountsList.map((account) => (
                            <div key={account.id} className="relative">
                                <AccountCard account={account} />
                                <button
                                    onClick={() => setActiveView("projections")}
                                    className="absolute top-2 right-2 z-20 bg-pastel-pink hover:bg-pastel-pink/80 text-pastel-pink-foreground px-2 py-1 rounded text-xs transition-colors shadow-sm"
                                >
                                    Projection
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant={
                                    activeView === "transactions"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setActiveView(
                                        activeView === "transactions"
                                            ? null
                                            : "transactions"
                                    )
                                }
                                className="flex items-center gap-2"
                            >
                                <List className="h-4 w-4" />
                                Recent Transactions
                            </Button>

                            <Button
                                variant={
                                    activeView === "analytics"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setActiveView(
                                        activeView === "analytics"
                                            ? null
                                            : "analytics"
                                    )
                                }
                                className="flex items-center gap-2"
                            >
                                <BarChart3 className="h-4 w-4" />
                                Analytics
                            </Button>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    {activeView === "transactions" && (
                        <div className="bg-card rounded-xl border shadow-sm">
                            <div className="p-6 border-b flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-semibold text-foreground">
                                        Recent Transactions
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <Select
                                            value={accountFilter}
                                            onValueChange={setAccountFilter}
                                        >
                                            <SelectTrigger className="w-36">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">
                                                    All Accounts
                                                </SelectItem>
                                                {accountsList.map((account) => (
                                                    <SelectItem
                                                        key={account.id}
                                                        value={account.name}
                                                    >
                                                        {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CategoryManager
                                        categories={categoriesList}
                                        onUpdateCategories={
                                            handleUpdateCategories
                                        }
                                    />
                                    <Dialog
                                        open={isAddModalOpen}
                                        onOpenChange={setIsAddModalOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Transaction
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Add New Transaction
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Fill in the details below to
                                                    add a new transaction to
                                                    your account.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    handleAddTransaction();
                                                }}
                                                className="space-y-4"
                                            >
                                                <div className="space-y-2">
                                                    <Label htmlFor="type">
                                                        Type
                                                    </Label>
                                                    <Select
                                                        value={
                                                            newTransaction.transactionType
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setNewTransaction({
                                                                ...newTransaction,
                                                                transactionType:
                                                                    value,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="expense">
                                                                Expense
                                                            </SelectItem>
                                                            <SelectItem value="income">
                                                                Income
                                                            </SelectItem>
                                                            <SelectItem value="transfer">
                                                                Transfer
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="date">
                                                        Date
                                                    </Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start text-left font-normal"
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {newTransaction.date ? (
                                                                    format(
                                                                        new Date(
                                                                            newTransaction.date
                                                                        ),
                                                                        "MMMM d, yyyy"
                                                                    )
                                                                ) : (
                                                                    <span>
                                                                        Pick a
                                                                        date
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    new Date(
                                                                        newTransaction.date
                                                                    )
                                                                }
                                                                onSelect={(
                                                                    date
                                                                ) =>
                                                                    date &&
                                                                    setNewTransaction(
                                                                        {
                                                                            ...newTransaction,
                                                                            date: format(
                                                                                date,
                                                                                "yyyy-MM-dd"
                                                                            ),
                                                                        }
                                                                    )
                                                                }
                                                                initialFocus
                                                                className="p-3 pointer-events-auto"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="description">
                                                        Description
                                                    </Label>
                                                    <Input
                                                        id="description"
                                                        value={
                                                            newTransaction.description
                                                        }
                                                        onChange={(e) =>
                                                            setNewTransaction({
                                                                ...newTransaction,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="e.g., Grocery shopping"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="amount">
                                                        Amount
                                                    </Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            newTransaction.amount
                                                        }
                                                        onChange={(e) =>
                                                            setNewTransaction({
                                                                ...newTransaction,
                                                                amount: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>

                                                {/* Conditional rendering based on transaction type */}
                                                {newTransaction.transactionType ===
                                                "transfer" ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="fromAccount">
                                                                From Account
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    newTransaction.fromAccount
                                                                }
                                                                onValueChange={(
                                                                    value
                                                                ) =>
                                                                    setNewTransaction(
                                                                        {
                                                                            ...newTransaction,
                                                                            fromAccount:
                                                                                value,
                                                                        }
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select account to transfer from" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {accountsList.map(
                                                                        (
                                                                            acc
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    acc.id
                                                                                }
                                                                                value={
                                                                                    acc.name
                                                                                }
                                                                            >
                                                                                {
                                                                                    acc.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="toAccount">
                                                                To Account
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    newTransaction.toAccount
                                                                }
                                                                onValueChange={(
                                                                    value
                                                                ) =>
                                                                    setNewTransaction(
                                                                        {
                                                                            ...newTransaction,
                                                                            toAccount:
                                                                                value,
                                                                        }
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select account to transfer to" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {accountsList.map(
                                                                        (
                                                                            acc
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    acc.id
                                                                                }
                                                                                value={
                                                                                    acc.name
                                                                                }
                                                                            >
                                                                                {
                                                                                    acc.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="category">
                                                                Category
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    newTransaction.category
                                                                }
                                                                onValueChange={(
                                                                    value
                                                                ) =>
                                                                    setNewTransaction(
                                                                        {
                                                                            ...newTransaction,
                                                                            category:
                                                                                value,
                                                                        }
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select category" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {categoriesList.map(
                                                                        (
                                                                            cat
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    cat.id
                                                                                }
                                                                                value={
                                                                                    cat.name
                                                                                }
                                                                            >
                                                                                {
                                                                                    cat.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="account">
                                                                Account
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    newTransaction.account
                                                                }
                                                                onValueChange={(
                                                                    value
                                                                ) =>
                                                                    setNewTransaction(
                                                                        {
                                                                            ...newTransaction,
                                                                            account:
                                                                                value,
                                                                        }
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select account" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {accountsList.map(
                                                                        (
                                                                            acc
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    acc.id
                                                                                }
                                                                                value={
                                                                                    acc.name
                                                                                }
                                                                            >
                                                                                {
                                                                                    acc.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </>
                                                )}

                                                <div className="space-y-2">
                                                    <Label htmlFor="status">
                                                        Status
                                                    </Label>
                                                    <Select
                                                        value={
                                                            newTransaction.status
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setNewTransaction({
                                                                ...newTransaction,
                                                                status: value,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">
                                                                Pending
                                                            </SelectItem>
                                                            <SelectItem value="cleared">
                                                                Cleared
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Recurring transactions only for non-transfers */}
                                                {newTransaction.transactionType !==
                                                    "transfer" && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="recurring"
                                                                checked={
                                                                    newTransaction.isRecurring
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    setNewTransaction(
                                                                        {
                                                                            ...newTransaction,
                                                                            isRecurring:
                                                                                checked,
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                            <Label htmlFor="recurring">
                                                                Recurring
                                                                Transaction
                                                            </Label>
                                                        </div>

                                                        {newTransaction.isRecurring && (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="frequency">
                                                                    Frequency
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        newTransaction.recurringFrequency
                                                                    }
                                                                    onValueChange={(
                                                                        value
                                                                    ) =>
                                                                        setNewTransaction(
                                                                            {
                                                                                ...newTransaction,
                                                                                recurringFrequency:
                                                                                    value,
                                                                            }
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="weekly">
                                                                            Weekly
                                                                        </SelectItem>
                                                                        <SelectItem value="monthly">
                                                                            Monthly
                                                                        </SelectItem>
                                                                        <SelectItem value="yearly">
                                                                            Yearly
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setIsAddModalOpen(
                                                                false
                                                            )
                                                        }
                                                        className="flex-1"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="flex-1"
                                                    >
                                                        {newTransaction.transactionType ===
                                                        "transfer"
                                                            ? "Add Transfer"
                                                            : "Add Transaction"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <TransactionsList
                                transactions={filteredTransactions}
                                onUpdateTransactionStatus={
                                    handleUpdateTransactionStatus
                                }
                                onUpdateTransaction={handleEditTransaction}
                                onDeleteTransaction={handleDeleteTransaction}
                                accounts={accountsList}
                                categories={categoriesList}
                            />
                        </div>
                    )}

                    {/* Edit Transaction Modal */}
                    <Dialog
                        open={isEditModalOpen}
                        onOpenChange={setIsEditModalOpen}
                    >
                        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Transaction</DialogTitle>
                                <DialogDescription>
                                    Update the transaction details below.
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateTransaction();
                                }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={
                                            editingTransaction?.transactionType
                                        }
                                        onValueChange={(value) =>
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                transactionType: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="expense">
                                                Expense
                                            </SelectItem>
                                            <SelectItem value="income">
                                                Income
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {editingTransaction?.date ? (
                                                    format(
                                                        new Date(
                                                            editingTransaction.date
                                                        ),
                                                        "MMMM d, yyyy"
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    new Date(
                                                        editingTransaction?.date ||
                                                            new Date()
                                                    )
                                                }
                                                onSelect={(date) =>
                                                    date &&
                                                    setEditingTransaction({
                                                        ...editingTransaction,
                                                        date: format(
                                                            date,
                                                            "yyyy-MM-dd"
                                                        ),
                                                    })
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={
                                            editingTransaction?.description ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Enter description"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={editingTransaction?.amount || ""}
                                        onChange={(e) =>
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                amount: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={editingTransaction?.category}
                                        onValueChange={(value) =>
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                category: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoriesList.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={cat.name}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="account">Account</Label>
                                    <Select
                                        value={editingTransaction?.account}
                                        onValueChange={(value) =>
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                account: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accountsList.map((acc) => (
                                                <SelectItem
                                                    key={acc.id}
                                                    value={acc.name}
                                                >
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={editingTransaction?.status}
                                        onValueChange={(value) =>
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                status: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="cleared">
                                                Cleared
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="recurring"
                                        checked={
                                            editingTransaction?.isRecurring ||
                                            false
                                        }
                                        onCheckedChange={(checked) =>
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                isRecurring: checked,
                                            })
                                        }
                                    />
                                    <Label htmlFor="recurring">
                                        Recurring Transaction
                                    </Label>
                                </div>

                                {editingTransaction?.isRecurring && (
                                    <div className="space-y-2">
                                        <Label htmlFor="frequency">
                                            Frequency
                                        </Label>
                                        <Select
                                            value={
                                                editingTransaction?.recurringFrequency
                                            }
                                            onValueChange={(value) =>
                                                setEditingTransaction({
                                                    ...editingTransaction,
                                                    recurringFrequency: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="weekly">
                                                    Weekly
                                                </SelectItem>
                                                <SelectItem value="monthly">
                                                    Monthly
                                                </SelectItem>
                                                <SelectItem value="yearly">
                                                    Yearly
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsEditModalOpen(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">
                                        Update Transaction
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Analytics */}
                    {activeView === "analytics" && (
                        <Analytics
                            transactions={transactionsList}
                            accounts={accountsList}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
