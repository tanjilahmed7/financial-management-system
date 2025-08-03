import { Button } from "@/Components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/DropdownMenu";
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Edit,
    MoreHorizontal,
    Trash2,
} from "lucide-react";

export function TransactionsList({
    transactions,
    onUpdateTransactionStatus,
    onUpdateTransaction,
    onDeleteTransaction,
    accounts,
    categories,
}) {
    const formatAmount = (amount) => {
        const formatted = Math.abs(amount).toLocaleString("en-CA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
    };

    const getStatusIcon = (status) => {
        return status === "cleared" ? (
            <CheckCircle className="h-4 w-4 text-success" />
        ) : (
            <Clock className="h-4 w-4 text-amber-500" />
        );
    };

    const getAmountColor = (amount) => {
        return amount >= 0 ? "text-success" : "text-destructive";
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/30">
                        <th className="text-left p-4 font-medium text-muted-foreground">
                            Date
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                            Description
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                            Category
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                            Account
                        </th>
                        <th className="text-right p-4 font-medium text-muted-foreground">
                            Amount
                        </th>
                        <th className="text-center p-4 font-medium text-muted-foreground">
                            Status
                        </th>
                        {(onUpdateTransactionStatus ||
                            onUpdateTransaction ||
                            onDeleteTransaction) && (
                            <th className="text-center p-4 font-medium text-muted-foreground">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr
                            key={transaction.id}
                            className="border-b hover:bg-muted/20 transition-colors"
                        >
                            <td className="p-4 text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString(
                                    "en-CA"
                                )}
                            </td>
                            <td className="p-4 font-medium text-foreground">
                                {transaction.description}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                                {transaction.category}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                                {transaction.account}
                            </td>
                            <td
                                className={`p-4 text-right font-semibold ${getAmountColor(
                                    transaction.amount
                                )}`}
                            >
                                {formatAmount(transaction.amount)}
                            </td>
                            <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {getStatusIcon(transaction.status)}
                                    <span
                                        className={`text-xs ${
                                            transaction.status === "cleared"
                                                ? "text-success"
                                                : "text-amber-600"
                                        }`}
                                    >
                                        {transaction.status === "cleared"
                                            ? "Cleared"
                                            : "Pending"}
                                    </span>
                                    {transaction.recurring && (
                                        <span className="text-xs bg-primary/20 text-primary px-1 rounded ml-1">
                                            {transaction.recurringFrequency ||
                                                "Recurring"}
                                        </span>
                                    )}
                                </div>
                            </td>
                            {(onUpdateTransactionStatus ||
                                onUpdateTransaction ||
                                onDeleteTransaction) && (
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {onUpdateTransaction && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateTransaction(
                                                            transaction
                                                        )
                                                    }
                                                >
                                                    <Edit className="mr-2 h-3 w-3" />
                                                    Edit
                                                </DropdownMenuItem>
                                            )}
                                            {onUpdateTransactionStatus && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateTransactionStatus(
                                                            transaction.id,
                                                            transaction.status ===
                                                                "pending"
                                                                ? "cleared"
                                                                : "pending"
                                                        )
                                                    }
                                                >
                                                    {transaction.status ===
                                                    "pending" ? (
                                                        <CheckCircle className="mr-2 h-3 w-3" />
                                                    ) : (
                                                        <AlertCircle className="mr-2 h-3 w-3" />
                                                    )}
                                                    Mark as{" "}
                                                    {transaction.status ===
                                                    "pending"
                                                        ? "Cleared"
                                                        : "Pending"}
                                                </DropdownMenuItem>
                                            )}
                                            {onDeleteTransaction && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onDeleteTransaction(
                                                            transaction.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-3 w-3" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
